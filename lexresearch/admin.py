from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile,UserLogin

# Define an inline admin descriptor for UserProfile model
class UserProfileInline(admin.StackedInline):
    model = UserProfile

# Extend the UserAdmin to include the UserProfileInline
class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Register UserProfile
admin.site.register(UserProfile)



    
admin.site.register(UserLogin)
list_display = ['user', 'login_time']