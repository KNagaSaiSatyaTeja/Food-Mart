#!/usr/bin/env python3
"""
Food Mart Backend API Testing Suite
Tests all critical backend endpoints to ensure proper functionality
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get the base URL from environment or use default
BASE_URL = "https://6cfa56d3-eea4-4d52-827e-fa19c220b79c.preview.emergentagent.com/api"

class FoodMartAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_root_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == "Food Mart API is running!":
                    self.log_test("Root Endpoint", True, "API is running correctly")
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False

    def test_user_registration(self):
        """Test POST /api/auth/register"""
        try:
            test_user = {
                "name": "John Doe",
                "email": "john@test.com",
                "password": "password123"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=test_user,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token') and data.get('user'):
                    self.auth_token = data['token']
                    self.log_test("User Registration", True, "User registered successfully", 
                                f"Token received, User ID: {data['user'].get('id')}")
                    return True
                else:
                    self.log_test("User Registration", False, f"Invalid response structure: {data}")
                    return False
            elif response.status_code == 409:
                # User already exists, try to login instead
                self.log_test("User Registration", True, "User already exists (expected)", 
                            "Will test login with existing user")
                return True
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Request error: {str(e)}")
            return False

    def test_user_login(self):
        """Test POST /api/auth/login"""
        try:
            login_data = {
                "email": "john@test.com",
                "password": "password123"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token') and data.get('user'):
                    self.auth_token = data['token']
                    self.log_test("User Login", True, "Login successful", 
                                f"Token received, User: {data['user'].get('name')}")
                    return True
                else:
                    self.log_test("User Login", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Request error: {str(e)}")
            return False

    def test_products_endpoint(self):
        """Test GET /api/products"""
        try:
            response = requests.get(f"{self.base_url}/products", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'products' in data:
                    products = data['products']
                    if len(products) > 0:
                        # Check for expected sample products
                        product_names = [p.get('name', '') for p in products]
                        expected_products = ['Organic Bananas', 'Fresh Spinach Bundle', 'Pacific Barista Oat Milk']
                        found_products = [name for name in expected_products if any(name in pname for pname in product_names)]
                        
                        self.log_test("Products Endpoint", True, f"Retrieved {len(products)} products", 
                                    f"Found expected products: {found_products}")
                        return True
                    else:
                        self.log_test("Products Endpoint", False, "No products returned")
                        return False
                else:
                    self.log_test("Products Endpoint", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Products Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Products Endpoint", False, f"Request error: {str(e)}")
            return False

    def test_featured_products(self):
        """Test GET /api/products/featured"""
        try:
            response = requests.get(f"{self.base_url}/products/featured", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'products' in data:
                    products = data['products']
                    featured_count = len(products)
                    
                    # Verify all returned products are marked as featured
                    all_featured = all(p.get('featured', False) for p in products)
                    
                    if featured_count > 0 and all_featured:
                        self.log_test("Featured Products", True, f"Retrieved {featured_count} featured products", 
                                    f"All products correctly marked as featured")
                        return True
                    else:
                        self.log_test("Featured Products", False, 
                                    f"Issues with featured products: count={featured_count}, all_featured={all_featured}")
                        return False
                else:
                    self.log_test("Featured Products", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Featured Products", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Featured Products", False, f"Request error: {str(e)}")
            return False

    def test_product_filtering(self):
        """Test GET /api/products with category filter"""
        try:
            # Test category filter
            response = requests.get(f"{self.base_url}/products?category=fruits", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'products' in data:
                    products = data['products']
                    
                    # Verify all products are in fruits category
                    all_fruits = all(p.get('category') == 'fruits' for p in products)
                    
                    if len(products) > 0 and all_fruits:
                        self.log_test("Product Category Filter", True, f"Retrieved {len(products)} fruit products", 
                                    "All products correctly filtered by category")
                        return True
                    else:
                        self.log_test("Product Category Filter", False, 
                                    f"Filter issues: count={len(products)}, all_fruits={all_fruits}")
                        return False
                else:
                    self.log_test("Product Category Filter", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Product Category Filter", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Product Category Filter", False, f"Request error: {str(e)}")
            return False

    def test_product_search(self):
        """Test GET /api/products with search parameter"""
        try:
            # Test search functionality
            response = requests.get(f"{self.base_url}/products?search=banana", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'products' in data:
                    products = data['products']
                    
                    # Check if search results contain banana-related products
                    banana_products = [p for p in products if 'banana' in p.get('name', '').lower() or 
                                     'banana' in p.get('description', '').lower()]
                    
                    if len(banana_products) > 0:
                        self.log_test("Product Search", True, f"Found {len(banana_products)} banana products", 
                                    f"Search working correctly")
                        return True
                    else:
                        self.log_test("Product Search", False, "No banana products found in search results")
                        return False
                else:
                    self.log_test("Product Search", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Product Search", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Product Search", False, f"Request error: {str(e)}")
            return False

    def test_categories_endpoint(self):
        """Test GET /api/categories"""
        try:
            response = requests.get(f"{self.base_url}/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'categories' in data:
                    categories = data['categories']
                    
                    # Check for expected categories
                    category_slugs = [c.get('slug', '') for c in categories]
                    expected_categories = ['fruits', 'vegetables', 'dairy', 'snacks']
                    found_categories = [slug for slug in expected_categories if slug in category_slugs]
                    
                    if len(categories) > 0 and len(found_categories) >= 3:
                        self.log_test("Categories Endpoint", True, f"Retrieved {len(categories)} categories", 
                                    f"Found expected categories: {found_categories}")
                        return True
                    else:
                        self.log_test("Categories Endpoint", False, 
                                    f"Insufficient categories: total={len(categories)}, expected={len(found_categories)}")
                        return False
                else:
                    self.log_test("Categories Endpoint", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Categories Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Categories Endpoint", False, f"Request error: {str(e)}")
            return False

    def test_protected_orders_get(self):
        """Test GET /api/orders (protected route)"""
        if not self.auth_token:
            self.log_test("Protected Orders GET", False, "No auth token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            response = requests.get(f"{self.base_url}/orders", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'orders' in data:
                    orders = data['orders']
                    self.log_test("Protected Orders GET", True, f"Retrieved {len(orders)} orders", 
                                "Protected route working correctly")
                    return True
                else:
                    self.log_test("Protected Orders GET", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Protected Orders GET", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Protected Orders GET", False, f"Request error: {str(e)}")
            return False

    def test_protected_orders_post(self):
        """Test POST /api/orders (protected route)"""
        if not self.auth_token:
            self.log_test("Protected Orders POST", False, "No auth token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            sample_order = {
                "items": [
                    {
                        "id": "test-product-1",
                        "name": "Test Product",
                        "price": 9.99,
                        "quantity": 2
                    }
                ],
                "total": 19.98,
                "shippingAddress": {
                    "name": "John Doe",
                    "address": "123 Test St",
                    "city": "Test City",
                    "zipCode": "12345"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/orders",
                json=sample_order,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'order' in data:
                    order = data['order']
                    self.log_test("Protected Orders POST", True, "Order created successfully", 
                                f"Order ID: {order.get('id')}")
                    return True
                else:
                    self.log_test("Protected Orders POST", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Protected Orders POST", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Protected Orders POST", False, f"Request error: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test that protected routes require authentication"""
        try:
            # Test without token
            response = requests.get(f"{self.base_url}/orders", timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if not data.get('success') and 'Unauthorized' in data.get('error', ''):
                    self.log_test("Unauthorized Access Protection", True, "Protected route correctly rejects unauthorized access")
                    return True
                else:
                    self.log_test("Unauthorized Access Protection", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Unauthorized Access Protection", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Unauthorized Access Protection", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("FOOD MART BACKEND API TESTING SUITE")
        print("=" * 80)
        print(f"Testing against: {self.base_url}")
        print()
        
        # Test sequence
        tests = [
            ("Database Connection & Root API", self.test_root_endpoint),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Products API", self.test_products_endpoint),
            ("Featured Products", self.test_featured_products),
            ("Product Category Filter", self.test_product_filtering),
            ("Product Search", self.test_product_search),
            ("Categories API", self.test_categories_endpoint),
            ("Unauthorized Access Protection", self.test_unauthorized_access),
            ("Protected Orders GET", self.test_protected_orders_get),
            ("Protected Orders POST", self.test_protected_orders_post),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"Running: {test_name}")
            print("-" * 40)
            if test_func():
                passed += 1
            print()
        
        # Summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return passed == total

if __name__ == "__main__":
    tester = FoodMartAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)