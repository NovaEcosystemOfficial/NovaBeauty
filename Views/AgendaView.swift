import SwiftUI
import SwiftData
import UserNotifications

struct AgendaView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Query(sort: \Appuntamento.data) private var appuntamenti: [Appuntamento]

    @State private var errorMessage = ""

    private var appuntamentiUtente: [Appuntamento] {
        guard let userID = session.user?.uid else { return [] }
        return appuntamenti.filter { $0.ownerID == userID }
    }

    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                List {
                    
                    ForEach(appuntamentiUtente) { appuntamento in
                        
                        VStack(alignment: .leading, spacing: 6) {
                            
                            HStack {
                                Text(appuntamento.cliente?.nome ?? "Cliente non disponibile")
                                    .font(.headline)
                                    .foregroundColor(themeManager.theme.text)
                                
                                Spacer()
                                
                                Text("€ \(appuntamento.prezzo, specifier: "%.2f")")
                                    .foregroundColor(themeManager.theme.secondary)
                                    .bold()
                            }
                            
                            Text(appuntamento.servizio)
                                .font(.subheadline)
                                .foregroundColor(themeManager.theme.text)
                            
                            Text(appuntamento.data.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundColor(themeManager.theme.text.opacity(0.6))
                        }
                        .padding(.vertical, 6)
                    }
                    .onDelete(perform: elimina)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Agenda")
        }
        .alert("Errore", isPresented: Binding(
            get: { !errorMessage.isEmpty },
            set: { if !$0 { errorMessage = "" } }
        )) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func elimina(at offsets: IndexSet) {
        for index in offsets {
            let appuntamento = appuntamentiUtente[index]
            UNUserNotificationCenter.current().removePendingNotificationRequests(
                withIdentifiers: [appuntamento.notificationIdentifier]
            )
            context.delete(appuntamento)
        }
        do {
            try context.save()
        } catch {
            errorMessage = "Eliminazione non riuscita: \(error.localizedDescription)"
        }
    }
}
