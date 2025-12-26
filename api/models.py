from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'members'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the hashed password"""
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        """Always return True for authenticated members"""
        return True

    @property
    def is_anonymous(self):
        """Always return False for members"""
        return False

    def has_perm(self, perm, obj=None):
        """Check if the member has a specific permission"""
        return self.is_admin

    def has_module_perms(self, app_label):
        """Check if the member has permissions to view the app"""
        return self.is_admin


class Dialog(models.Model):
    participant1 = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='dialogs_as_participant1'
    )
    participant2 = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='dialogs_as_participant2'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dialogs'
        ordering = ['-updated_at']
        unique_together = [['participant1', 'participant2']]

    def __str__(self):
        return f"Dialog between {self.participant1.email} and {self.participant2.email}"

    def get_other_participant(self, member):
        """Get the other participant in the dialog"""
        if self.participant1.id == member.id:
            return self.participant2
        return self.participant1

    def is_participant(self, member):
        """Check if a member is a participant in this dialog"""
        return self.participant1.id == member.id or self.participant2.id == member.id


class Message(models.Model):
    dialog = models.ForeignKey(
        Dialog,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.email} at {self.created_at}"
