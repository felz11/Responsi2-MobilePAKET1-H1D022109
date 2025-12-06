import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/inventory.dart';

class ApiService {
  // Ganti dengan URL API Anda
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  // Untuk Android emulator gunakan: http://10.0.2.2:3000/api
  // Untuk device fisik gunakan IP komputer: http://192.168.x.x:3000/api

  // Auth APIs
  static Future<Map<String, dynamic>> register(
    String username,
    String password,
    String name,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
        'name': name,
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> login(
    String username,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  // Inventory APIs
  static Future<List<Inventory>> getInventories() async {
    final response = await http.get(Uri.parse('$baseUrl/inventories'));
    final data = jsonDecode(response.body);
    if (data['success']) {
      return (data['data'] as List)
          .map((json) => Inventory.fromJson(json))
          .toList();
    }
    return [];
  }

  static Future<Map<String, dynamic>> addInventory(Inventory inventory) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inventories'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(inventory.toJson()),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> updateInventory(
    int id,
    Inventory inventory,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/inventories/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(inventory.toJson()),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> deleteInventory(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/inventories/$id'));
    return jsonDecode(response.body);
  }
}
