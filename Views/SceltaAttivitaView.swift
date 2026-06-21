import SwiftUI
import SwiftData

struct SceltaAttivitaView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @Environment(\.modelContext) private var context

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

                }
            }
            .padding()
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

        let profilo = ProfiloAttivita(
            nome: "",
            telefono: "",
            indirizzo: "",
            email: "",
            orari: "",
            tipoAttivita: tipo
        )

        context.insert(profilo)
        try? context.save()

        // 🔥 aggiorna subito il tema
        themeManager.aggiornaTema(tipo: tipo)
    }
}
