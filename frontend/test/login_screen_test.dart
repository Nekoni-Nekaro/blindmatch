import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mocktail/mocktail.dart';
import 'package:go_router/go_router.dart';
import 'package:blindmatch/core/auth/auth_cubit.dart';
import 'package:blindmatch/core/api/api_client.dart';
import 'package:blindmatch/features/auth/screens/login_screen.dart';

class MockApiClient extends Mock implements ApiClient {}
class MockAuthCubit extends Mock implements AuthCubit {}

void main() {
  late MockApiClient mockApi;
  late MockAuthCubit mockCubit;

  setUp(() {
    mockApi = MockApiClient();
    mockCubit = MockAuthCubit();
  });

  Widget buildTestWidget() {
    return MaterialApp(
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<ApiClient>.value(value: mockApi),
        ],
        child: BlocProvider<AuthCubit>.value(
          value: mockCubit,
          child: const LoginScreen(),
        ),
      ),
    );
  }

  group('LoginScreen', () {
    testWidgets('renders email and password fields', (tester) async {
      when(() => mockCubit.state).thenReturn(AuthInitial());
      when(() => mockCubit.stream).thenAnswer((_) => const Stream.empty());

      await tester.pumpWidget(buildTestWidget());

      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Sign In'), findsOneWidget);
    });

    testWidgets('shows validation error for empty email', (tester) async {
      when(() => mockCubit.state).thenReturn(AuthInitial());
      when(() => mockCubit.stream).thenAnswer((_) => const Stream.empty());

      await tester.pumpWidget(buildTestWidget());
      await tester.tap(find.text('Sign In'));
      await tester.pump();

      expect(find.text('Enter your email'), findsOneWidget);
    });

    testWidgets('shows loading indicator when AuthLoading', (tester) async {
      when(() => mockCubit.state).thenReturn(AuthLoading());
      when(() => mockCubit.stream).thenAnswer((_) => const Stream.empty());

      await tester.pumpWidget(buildTestWidget());

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('calls login on valid form submit', (tester) async {
      when(() => mockCubit.state).thenReturn(AuthInitial());
      when(() => mockCubit.stream).thenAnswer((_) => const Stream.empty());
      when(() => mockCubit.login(any(), any())).thenAnswer((_) async {});

      await tester.pumpWidget(buildTestWidget());

      await tester.enterText(
        find.byType(TextFormField).first,
        'test@example.com',
      );
      await tester.enterText(find.byType(TextFormField).last, 'password123');
      await tester.tap(find.text('Sign In'));
      await tester.pump();

      verify(() => mockCubit.login('test@example.com', 'password123')).called(1);
    });
  });
}
