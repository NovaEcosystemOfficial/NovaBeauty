import SwiftUI
import SwiftData

struct ContentView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Query private var profili: [ProfiloAttivita]

    private var profiliUtente: [ProfiloAttivita] {
        guard let userID = session.user?.uid else { return [] }
        return profili.filter { $0.ownerID == userID }
    }

    private var haTipoAttivita: Bool {
        profiliUtente.contains { !$0.tipoAttivita.isEmpty }
    }

    var body: some View {
        Group {
            if !haTipoAttivita {
                SceltaAttivitaView()
            } else {
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
        .task(id: session.user?.uid) {
            guard let userID = session.user?.uid else { return }
            do {
                try DataOwnershipMigrator.claimLegacyData(for: userID, in: context)
                _ = try await CloudBackupService.restoreIfLocalDataIsMissing(
                    userID: userID,
                    context: context
                )
                let profiliAggiornati = try context.fetch(FetchDescriptor<ProfiloAttivita>())
                if let profilo = profiliAggiornati.first(where: { $0.ownerID == userID }) {
                    themeManager.aggiornaTema(tipo: profilo.tipoAttivita)
                }
            } catch {
                // La modalità locale resta disponibile anche senza rete o Firestore.
            }
        }
        .onChange(of: scenePhase) { _, phase in
            guard phase == .background, let userID = session.user?.uid else { return }
            Task {
                try? await CloudBackupService.backup(userID: userID, context: context)
            }
        }
    }
}
