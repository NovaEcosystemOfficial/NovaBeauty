import SwiftUI
import SwiftData

struct AggiungiProdottoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    
    @State private var nome = ""
    @State private var categoria = ""
    @State private var quantita = ""
    @State private var soglia = ""
    @State private var link = ""
    
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
    }
    
    private func salva() {
        guard let q = Int(quantita),
              let s = Int(soglia) else { return }
        
        let nuovo = ProdottoMagazzino(
            nome: nome,
            categoria: categoria,
            quantita: q,
            sogliaMinima: s,
            linkFornitore: link
        )
        
        context.insert(nuovo)
        dismiss()
    }
}
