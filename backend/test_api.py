#!/usr/bin/env python3
"""
Simple test script to verify the backend API is working
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_user_creation():
    """Test user creation"""
    try:
        user_data = {"user_id": "test_user_123"}
        response = requests.post(f"{BASE_URL}/users", json=user_data)
        print(f"✅ User creation: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ User creation failed: {e}")
        return False

def test_streak_save():
    """Test saving a streak"""
    try:
        streak_data = {
            "user_id": "test_user_123",
            "date": "2025-01-15",
            "tasks_completed": 3,
            "points_earned": 5,
            "is_completed": True
        }
        response = requests.post(f"{BASE_URL}/streaks", json=streak_data)
        print(f"✅ Streak save: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Streak save failed: {e}")
        return False

def test_streak_retrieval():
    """Test retrieving streaks"""
    try:
        response = requests.get(f"{BASE_URL}/streaks?user_id=test_user_123")
        print(f"✅ Streak retrieval: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Streak retrieval failed: {e}")
        return False

def test_export():
    """Test data export"""
    try:
        response = requests.get(f"{BASE_URL}/streaks/export?user_id=test_user_123")
        print(f"✅ Data export: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Data export failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Backend API...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("User Creation", test_user_creation),
        ("Streak Save", test_streak_save),
        ("Streak Retrieval", test_streak_retrieval),
        ("Data Export", test_export)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs.")

if __name__ == "__main__":
    main()
