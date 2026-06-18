import 'package:flutter/material.dart';

class AppTheme {
  static const _primaryColor = Color(0xFF6C63FF);
  static const _secondaryColor = Color(0xFFFF6584);
  static const _surfaceDark = Color(0xFF1A1A2E);
  static const _cardDark = Color(0xFF16213E);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primaryColor,
          secondary: _secondaryColor,
          brightness: Brightness.light,
        ),
        fontFamily: 'Inter',
        textTheme: _textTheme(Colors.black87),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          centerTitle: true,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          surfaceTintColor: Colors.transparent,
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          color: Colors.white,
          surfaceTintColor: Colors.transparent,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: _primaryColor,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              fontFamily: 'Inter',
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF5F5F7),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          selectedItemColor: _primaryColor,
          unselectedItemColor: Colors.black38,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primaryColor,
          secondary: _secondaryColor,
          brightness: Brightness.dark,
          surface: _surfaceDark,
        ),
        fontFamily: 'Inter',
        scaffoldBackgroundColor: _surfaceDark,
        textTheme: _textTheme(Colors.white),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          centerTitle: true,
          backgroundColor: _surfaceDark,
          foregroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          color: _cardDark,
          surfaceTintColor: Colors.transparent,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: _primaryColor,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: _cardDark,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      );

  static TextTheme _textTheme(Color color) => TextTheme(
        displayLarge: TextStyle(
          fontSize: 32, fontWeight: FontWeight.w700, color: color,
        ),
        displayMedium: TextStyle(
          fontSize: 28, fontWeight: FontWeight.w700, color: color,
        ),
        headlineMedium: TextStyle(
          fontSize: 22, fontWeight: FontWeight.w600, color: color,
        ),
        titleLarge: TextStyle(
          fontSize: 18, fontWeight: FontWeight.w600, color: color,
        ),
        titleMedium: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w500, color: color,
        ),
        bodyLarge: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w400, color: color,
        ),
        bodyMedium: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w400, color: color,
        ),
        labelLarge: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w600, color: color,
        ),
      );
}

// Extension for easy color access
extension ContextTheme on BuildContext {
  ColorScheme get colorScheme => Theme.of(this).colorScheme;
  TextTheme get textTheme => Theme.of(this).textTheme;
}
