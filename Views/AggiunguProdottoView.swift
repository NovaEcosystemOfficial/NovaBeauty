import SwiftUI
import SwiftData

struct AggiungiProdottoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    
    @State private var nome = ""
    @State private var categoria = ""
    @State private var quantita = ""
    @State private var soglia = ""
    @State private var link = ""
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                Form {
                    TextField("Nome prodotto", text: $nome)
                    TextField("Categoria", text: $categoria)
                    
                    TextField("Quantità iniziale", text: $quantita)
                        .keyboardType(.numberPad)
                    
                    TextField("Soglia minima", text: $soglia)
                        .keyboardType(.numberPad)
                    
                    TextField("Link fornitore", text: $link)
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Nuovo Prodotto")
            .toolbar {
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        salva()
                    }
                    .foregroundColor(themeManager.theme.primary)
                }
                
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.theme.text)
                }
            }
        }
        .alert("Dati non validi", isPresented: Binding(
            get: { !errorMessage.isEmpty },
            set: { if !$0 { errorMessage = "" } }
        )) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func salva() {
        guard let userID = session.user?.uid else {
            errorMessage = "Sessione non valida."
            return
        }
        let cleanName = nome.trimmed
        guard !cleanName.isEmpty,
              let q = Int(quantita), q >= 0,
              let s = Int(soglia), s >= 0 else {
            errorMessage = "Inserisci un nome e quantità non negative."
            return
        }
        
        let nuovo = ProdottoMagazzino(
            ownerID: userID,
            nome: cleanName,
            categoria: categoria.trimmed,
            quantita: q,
            sogliaMinima: s,
            linkFornitore: link.trimmed
        )
        
        context.insert(nuovo)
        dismiss()
    }
}
