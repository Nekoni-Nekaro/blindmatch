import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:blindmatch/core/auth/auth_cubit.dart';
import 'package:blindmatch/core/api/api_client.dart';

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('AuthCubit', () {
    test('initial state is AuthInitial', () {
      final cubit = AuthCubit(mockApi);
      expect(cubit.state, isA<AuthInitial>());
      cubit.close();
    });

    blocTest<AuthCubit, AuthState>(
      'emits [Loading, Authenticated] on successful login',
      build: () {
        when(() => mockApi.login(any(), any())).thenAnswer((_) async => 'token');
        when(() => mockApi.getMe()).thenAnswer((_) async => {'id': 'u1', 'email': 'test@example.com'});
        return AuthCubit(mockApi);
      },
      act: (cubit) => cubit.login('test@example.com', 'password123'),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthAuthenticated>(),
      ],
    );

    blocTest<AuthCubit, AuthState>(
      'emits [Loading, Error] on failed login',
      build: () {
        when(() => mockApi.login(any(), any())).thenThrow(
          DioException(
            requestOptions: RequestOptions(path: '/auth/login'),
            response: Response(
              requestOptions: RequestOptions(path: '/auth/login'),
              statusCode: 401,
            ),
          ),
        );
        return AuthCubit(mockApi);
      },
      act: (cubit) => cubit.login('bad@test.com', 'wrongpass'),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthError>(),
      ],
    );

    blocTest<AuthCubit, AuthState>(
      'emits Unauthenticated on logout',
      build: () {
        when(() => mockApi.logout()).thenAnswer((_) async {});
        return AuthCubit(mockApi);
      },
      act: (cubit) => cubit.logout(),
      expect: () => [isA<AuthUnauthenticated>()],
    );

    blocTest<AuthCubit, AuthState>(
      'emits Unauthenticated on checkAuth with no token',
      build: () {
        when(() => mockApi.getToken()).thenAnswer((_) async => null);
        return AuthCubit(mockApi);
      },
      act: (cubit) => cubit.checkAuth(),
      expect: () => [isA<AuthUnauthenticated>()],
    );
  });
}
