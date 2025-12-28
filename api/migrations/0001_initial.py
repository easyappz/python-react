# Generated migration

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=255, unique=True)),
                ('password_hash', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('business_name', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'members',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tax_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('language', models.CharField(default='en', max_length=2)),
                ('default_period', models.CharField(choices=[('day', 'Day'), ('week', 'Week'), ('month', 'Month'), ('quarter', 'Quarter'), ('year', 'Year')], default='month', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('member', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to='api.member')),
            ],
            options={
                'db_table': 'user_settings',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('income', 'Income'), ('expense', 'Expense')], max_length=10)),
                ('color', models.CharField(blank=True, max_length=7, null=True)),
                ('icon', models.CharField(blank=True, max_length=50, null=True)),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='api.member')),
            ],
            options={
                'db_table': 'categories',
                'ordering': ['name'],
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('income', 'Income'), ('expense', 'Expense')], max_length=10)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('date', models.DateField()),
                ('description', models.TextField(blank=True, null=True)),
                ('counterparty', models.CharField(blank=True, max_length=255, null=True)),
                ('project', models.CharField(blank=True, max_length=255, null=True)),
                ('account', models.CharField(blank=True, max_length=255, null=True)),
                ('document', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to='api.category')),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='api.member')),
            ],
            options={
                'db_table': 'transactions',
                'ordering': ['-date', '-created_at'],
            },
        ),
    ]
