import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _baseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'https://api.blindmatch.app',
);

class ApiClient {
  late final Dio dio;
  final _storage = const FlutterSecureStorage();

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.addAll([
      _AuthInterceptor(_storage, dio),
      LogInterceptor(
        requestBody: false,
        responseBody: false,
        error: true,
      ),
    ]);
  }

  // ── Auth ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>> register(String email, String password) async {
    final res = await dio.post('/auth/register', data: {
      'email': email,
      'password': password,
    });
    return res.data;
  }

  Future<String> login(String email, String password) async {
    final res = await dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final token = res.data['accessToken'] as String;
    await _storage.write(key: 'access_token', value: token);
    return token;
  }

  Future<void> logout() async {
    try { await dio.post('/auth/logout'); } catch (_) {}
    await _storage.deleteAll();
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await dio.get('/auth/me');
    return res.data;
  }

  // ── Profile ───────────────────────────────────────────────────
  Future<Map<String, dynamic>> getMyProfile() async {
    final res = await dio.get('/profiles/me');
    return res.data;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await dio.patch('/profiles/me', data: data);
    return res.data;
  }

  Future<List<dynamic>> getCandidates({int limit = 20}) async {
    final res = await dio.get('/profiles/candidates', queryParameters: {'limit': limit});
    return res.data as List;
  }

  Future<Map<String, dynamic>> getPublicProfile(String profileId, int stage) async {
    final res = await dio.get('/profiles/$profileId', queryParameters: {'stage': stage});
    return res.data;
  }

  // ── Matches ───────────────────────────────────────────────────
  Future<List<dynamic>> getMatches() async {
    final res = await dio.get('/matches');
    return res.data as List;
  }

  Future<Map<String, dynamic>> likeProfile(String profileId) async {
    final res = await dio.post('/matches/$profileId/like');
    return res.data;
  }

  Future<void> passProfile(String profileId) async {
    await dio.post('/matches/$profileId/pass');
  }

  Future<Map<String, dynamic>> requestReveal(String matchId) async {
    final res = await dio.post('/matches/$matchId/reveal');
    return res.data;
  }

  // ── Chat ──────────────────────────────────────────────────────
  Future<List<dynamic>> getMessages(String matchId, {String? before}) async {
    final res = await dio.get(
      '/chat/$matchId/messages',
      queryParameters: {if (before != null) 'before': before},
    );
    return res.data as List;
  }

  Future<Map<String, dynamic>> sendMessage(
    String matchId, String content, String type,
  ) async {
    final res = await dio.post(
      '/chat/$matchId/messages',
      data: {'content': content, 'type': type},
    );
    return res.data;
  }

  // ── Rooms ─────────────────────────────────────────────────────
  Future<List<dynamic>> getRooms({String? topic}) async {
    final res = await dio.get(
      '/rooms',
      queryParameters: {if (topic != null) 'topic': topic},
    );
    return res.data as List;
  }

  // ── AI ────────────────────────────────────────────────────────
  Future<String> getDailyQuestion() async {
    final res = await dio.get('/ai/daily-question');
    return res.data.toString();
  }

  Future<List<String>> getIcebreakers(String matchId) async {
    final res = await dio.get('/ai/icebreakers/$matchId');
    return List<String>.from(res.data);
  }

  // ── Files ─────────────────────────────────────────────────────
  Future<String> uploadPhoto(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await dio.post('/files/photo', data: formData);
    return res.data['url'] as String;
  }

  Future<String> uploadVoice(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await dio.post('/files/voice', data: formData);
    return res.data['url'] as String;
  }

  Future<String?> getToken() => _storage.read(key: 'access_token');
}

class _AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;
  final Dio _dio;

  _AuthInterceptor(this._storage, this._dio);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      try {
        final res = await _dio.post('/auth/refresh');
        final newToken = res.data['accessToken'] as String;
        await _storage.write(key: 'access_token', value: newToken);
        // Retry original request
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final retried = await _dio.fetch(err.requestOptions);
        handler.resolve(retried);
        return;
      } catch (_) {
        await _storage.deleteAll();
      }
    }
    handler.next(err);
  }
}
