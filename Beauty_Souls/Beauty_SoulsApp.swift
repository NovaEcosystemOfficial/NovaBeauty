import SwiftUI
import SwiftData
import FirebaseCore

@main
struct Beauty_SoulsApp: App {
    @StateObject private var theme = ThemeManager()
    @StateObject private var session = AuthSessionManager()

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            SplashView()
                .environmentObject(theme)
                .environmentObject(session)
        }
        .modelContainer(for: [
            Cliente.self,
            Appuntamento.self,
            ProdottoMagazzino.self,
            ProfiloAttivita.self,
            Servizio.self
        ])
    }
}
