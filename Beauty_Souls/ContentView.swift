import SwiftUI
import SwiftData

struct ContentView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @Query private var profili: [ProfiloAttivita]   // 👈 IMPORTANTISSIMO

    private var haTipoAttivita: Bool {
        profili.contains { !$0.tipoAttivita.isEmpty }
    }

    var body: some View {

        if !haTipoAttivita {

            // 🔥 SCHERMATA INIZIALE
            SceltaAttivitaView()

        } else {

            // 🔥 APP NORMALE
            TabView {

                DashboardView()
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }

                AgendaView()
                    .tabItem {
                        Label("Agenda", systemImage: "calendar")
                    }

                ClientiView()
                    .tabItem {
                        Label("Clienti", systemImage: "person.3.fill")
                    }

                ServiziView()
                    .tabItem {
                        Label("Servizi", systemImage: "scissors")
                    }

                StatisticheView()
                    .tabItem {
                        Label("Statistiche", systemImage: "chart.bar.fill")
                    }

                MagazzinoView()
                    .tabItem {
                        Label("Magazzino", systemImage: "shippingbox.fill")
                    }

                ProfiloView()
                    .tabItem {
                        Label("Profilo", systemImage: "person.crop.circle.fill")
                    }
            }
            .tint(themeManager.theme.primary)
        }
    }
}
