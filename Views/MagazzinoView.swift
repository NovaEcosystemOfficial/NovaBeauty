import SwiftUI
import SwiftData

struct MagazzinoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Query private var prodotti: [ProdottoMagazzino]
    
    @State private var mostraAggiunta = false

    private var prodottiUtente: [ProdottoMagazzino] {
        guard let userID = session.userID else { return [] }
        return prodotti
            .filter { $0.ownerID == userID }
            .sorted { $0.nome.localizedCaseInsensitiveCompare($1.nome) == .orderedAscending }
    }

    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                List {
                    ForEach(prodottiUtente) { prodotto in
                        
                        VStack(alignment: .leading, spacing: 6) {
                            
                            HStack {
                                Text(prodotto.nome)
                                    .font(.headline)
                                    .foregroundColor(themeManager.theme.text)
                                
                                Spacer()
                                
                                Text("Qtà: \(prodotto.quantita)")
                                    .foregroundColor(
                                        prodotto.quantita <= prodotto.sogliaMinima
                                        ? .red
                                        : themeManager.theme.text
                                    )
                            }
                            
                            Text("Categoria: \(prodotto.categoria)")
                                .font(.subheadline)
                                .foregroundColor(themeManager.theme.text.opacity(0.6))
                            
                            HStack {
                                
                                Button("-") {
                                    if prodotto.quantita > 0 {
                                        prodotto.quantita -= 1
                                    }
                                }
                                .buttonStyle(.bordered)
                                .tint(themeManager.theme.secondary)
                                
                                Button("+") {
                                    prodotto.quantita += 1
                                }
                                .buttonStyle(.bordered)
                                .tint(themeManager.theme.secondary)
                                
                                Spacer()
                                
                                Button("Ordina") {
                                    if let url = URL(string: prodotto.linkFornitore) {
                                        UIApplication.shared.open(url)
                                    }
                                }
                                .foregroundColor(themeManager.theme.primary)
                            }
                        }
                        .padding(.vertical, 6)
                    }
                    .onDelete(perform: elimina)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Magazzino")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        mostraAggiunta = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .foregroundColor(themeManager.theme.primary)
                }
            }
        }
        .sheet(isPresented: $mostraAggiunta) {
            AggiungiProdottoView()
        }
    }
    
    private func elimina(at offsets: IndexSet) {
        for index in offsets {
            context.delete(prodottiUtente[index])
        }
    }
}
