import SwiftUI
import SwiftData

struct MagazzinoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Query private var prodotti: [ProdottoMagazzino]
    
    @State private var mostraAggiunta = false
    
    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                List {
                    ForEach(prodotti) { prodotto in
                        
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
            context.delete(prodotti[index])
        }
    }
}
