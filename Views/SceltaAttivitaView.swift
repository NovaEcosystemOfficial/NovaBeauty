import SwiftUI
import SwiftData

struct SceltaAttivitaView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager
    @Environment(\.modelContext) private var context
    @Query private var profili: [ProfiloAttivita]

    @State private var errorMessage = ""

    var body: some View {

        ZStack {
            themeManager.theme.background
                .ignoresSafeArea()

            VStack(spacing: 30) {

                Text("Che tipo di attività hai?")
                    .font(.largeTitle.bold())
                    .foregroundColor(themeManager.theme.primary)
                    .multilineTextAlignment(.center)

                VStack(spacing: 15) {

                    bottone("Centro Estetico", tipo: "estetica")
                    bottone("Barber Shop", tipo: "barber")
                    bottone("Parrucchiere", tipo: "parrucchiere")
                    bottone("Nail Artist", tipo: "nails")

                }
            }
            .padding()
        }
        .alert("Impossibile salvare", isPresented: Binding(
            get: { !errorMessage.isEmpty },
            set: { if !$0 { errorMessage = "" } }
        )) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }

    // MARK: - BOTTONE STILE
    private func bottone(_ titolo: String, tipo: String) -> some View {
        Button {
            salva(tipo: tipo)
        } label: {
            Text(titolo)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(themeManager.theme.card)
                .foregroundColor(themeManager.theme.text)
                .cornerRadius(15)
        }
    }

    // MARK: - SALVA + CAMBIA TEMA
    private func salva(tipo: String) {
        guard let userID = session.userID else {
            errorMessage = "Sessione non valida. Accedi nuovamente."
            return
        }

        let profiliUtente = profili.filter { $0.ownerID == userID }
        if let profilo = profiliUtente.first {
            profilo.tipoAttivita = tipo
            for duplicato in profiliUtente.dropFirst() {
                context.delete(duplicato)
            }
        } else {
            context.insert(ProfiloAttivita(
                ownerID: userID,
                nome: "",
                telefono: "",
                indirizzo: "",
                email: "",
                orari: "",
                tipoAttivita: tipo
            ))
        }

        do {
            try context.save()
            themeManager.aggiornaTema(tipo: tipo)
        } catch {
            errorMessage = "Salvataggio non riuscito: \(error.localizedDescription)"
        }
    }
}
