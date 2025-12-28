from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


class Member(models.Model):
    """Member model for authentication"""
    email = models.EmailField(unique=True, max_length=255)
    password_hash = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'members'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hash and set password"""
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        """Check password against hash"""
        return check_password(raw_password, self.password_hash)

    # DRF compatibility properties and methods
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class UserSettings(models.Model):
    """User settings model"""
    PERIOD_CHOICES = [
        ('day', 'Day'),
        ('week', 'Week'),
        ('month', 'Month'),
        ('quarter', 'Quarter'),
        ('year', 'Year'),
    ]

    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='settings')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='USD')
    language = models.CharField(max_length=2, default='en')
    default_period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='month')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_settings'

    def __str__(self):
        return f"Settings for {self.member.email}"


class Category(models.Model):
    """Category model for transactions"""
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    color = models.CharField(max_length=7, null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    """Transaction model for income and expenses"""
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='transactions')
    description = models.TextField(null=True, blank=True)
    counterparty = models.CharField(max_length=255, null=True, blank=True)
    project = models.CharField(max_length=255, null=True, blank=True)
    account = models.CharField(max_length=255, null=True, blank=True)
    document = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.type} - {self.amount} on {self.date}"
