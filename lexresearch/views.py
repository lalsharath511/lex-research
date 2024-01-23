from django.shortcuts import render,redirect
from .models import UserProfile
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import UserLogin,User
from datetime import datetime
from django.utils import timezone

# Create your views here.

def index(request):
    return render(request, 'index.html')



def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        verify_password = request.POST.get('verifyPassword')

        # Check if passwords match
        if password != verify_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('signup')  # Redirect back to signup page

        # Check if the username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists. Choose a different username.')
            return redirect('signup')  # Redirect back to signup page

        # Create a new user
        user = User.objects.create_user(username=username, password=password)
        user.save()

        messages.success(request, 'Account created successfully. You can now sign in.')
        return redirect('signin')  # Redirect to the signin page

    return render(request, 'signup.html')


def signin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Log the user in
            login(request, user)

            # Save user login information
            UserLogin.objects.create(user=user,login_time=timezone.now())

            # Redirect to the desired page after login (e.g., chat page)
            return redirect('/chat/')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'signin.html')


def chat(request):
    return render(request, 'chat.html')