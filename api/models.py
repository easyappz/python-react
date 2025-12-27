from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


class Member(models.Model):
    """User model for the application"""
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    avatar = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Required properties for DRF authentication
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password is correct"""
        return check_password(raw_password, self.password_hash)

    def has_perm(self, perm, obj=None):
        """Required for DRF permissions"""
        return True

    def has_module_perms(self, app_label):
        """Required for DRF permissions"""
        return True

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Member'
        verbose_name_plural = 'Members'

    def __str__(self):
        return self.username


class Board(models.Model):
    """Board model representing a project board"""
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    background_color = models.CharField(max_length=7, default='#0079BF')
    owner = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='owned_boards')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Board'
        verbose_name_plural = 'Boards'

    def __str__(self):
        return self.title


class BoardMember(models.Model):
    """Many-to-many relationship between boards and members"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='board_members')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='board_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    class Meta:
        ordering = ['board', 'member']
        unique_together = ['board', 'member']
        verbose_name = 'Board Member'
        verbose_name_plural = 'Board Members'

    def __str__(self):
        return f"{self.member.username} - {self.board.title} ({self.role})"


class Column(models.Model):
    """Column model representing a list in a board"""
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    title = models.CharField(max_length=255)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Column'
        verbose_name_plural = 'Columns'

    def __str__(self):
        return f"{self.board.title} - {self.title}"


class Label(models.Model):
    """Label model for categorizing cards"""
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#61BD4F')

    class Meta:
        ordering = ['name']
        verbose_name = 'Label'
        verbose_name_plural = 'Labels'

    def __str__(self):
        return f"{self.board.title} - {self.name}"


class Card(models.Model):
    """Card model representing a task"""
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='cards')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    position = models.IntegerField(default=0)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Card'
        verbose_name_plural = 'Cards'

    def __str__(self):
        return self.title


class CardLabel(models.Model):
    """Many-to-many relationship between cards and labels"""
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='card_labels')
    label = models.ForeignKey(Label, on_delete=models.CASCADE, related_name='card_labels')

    class Meta:
        ordering = ['card', 'label']
        unique_together = ['card', 'label']
        verbose_name = 'Card Label'
        verbose_name_plural = 'Card Labels'

    def __str__(self):
        return f"{self.card.title} - {self.label.name}"


class Checklist(models.Model):
    """Checklist model for cards"""
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='checklists')
    title = models.CharField(max_length=255)

    class Meta:
        ordering = ['id']
        verbose_name = 'Checklist'
        verbose_name_plural = 'Checklists'

    def __str__(self):
        return f"{self.card.title} - {self.title}"


class ChecklistItem(models.Model):
    """Checklist item model"""
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name='items')
    text = models.CharField(max_length=500)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']
        verbose_name = 'Checklist Item'
        verbose_name_plural = 'Checklist Items'

    def __str__(self):
        return f"{self.checklist.title} - {self.text}"


class Comment(models.Model):
    """Comment model for cards"""
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'

    def __str__(self):
        return f"{self.author.username} on {self.card.title}"


class Attachment(models.Model):
    """Attachment model for cards"""
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Attachment'
        verbose_name_plural = 'Attachments'

    def __str__(self):
        return f"{self.card.title} - {self.filename}"
