from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'phone', 'is_staff')
    list_filter = ('is_staff', )
    search_fields = ('email', 'username', 'phone')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'phone', 'avatar', 'rating')}),
        ('Permissions', {'fields': ('is_active', 'is_staff')}),
    )