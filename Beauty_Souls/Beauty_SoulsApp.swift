import SwiftUI
import SwiftData
import UserNotifications
import FirebaseCore

@main
struct Beauty_SoulsApp: App {
    
    @StateObject var theme = ThemeManager()
    
    init() {
        FirebaseApp.configure()
        
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Permesso notifiche concesso")
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            SplashView()
                .environmentObject(theme)
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
