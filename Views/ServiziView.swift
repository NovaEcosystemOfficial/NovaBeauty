import SwiftUI
import SwiftData

struct ServiziView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Query private var servizi: [Servizio]
    
    @State private var nome = ""
    @State private var prezzo = ""
    @State private var durata = ""
    
    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                VStack {
                    
                    List {
                        ForEach(servizi) { servizio in
                            
                            VStack(alignment: .leading, spacing: 4) {
                                
                                Text(servizio.nome)
                                    .font(.headline)
                                    .foregroundColor(themeManager.theme.text)
                                
                                HStack {
                                    Text("€ \(servizio.prezzo)")
                                    Text("•")
                                    Text("\(servizio.durata) min")
                                }
                                .font(.subheadline)
                                .foregroundColor(themeManager.theme.text.opacity(0.6))
                            }
                            .padding(.vertical, 6)
                        }
                        .onDelete(perform: eliminaServizio)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    
                    VStack(spacing: 10) {
                        
                        TextField("Nome servizio", text: $nome)
                            .textFieldStyle(.roundedBorder)
                        
                        TextField("Prezzo", text: $prezzo)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.decimalPad)
                        
                        TextField("Durata minuti", text: $durata)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.numberPad)
                        
                        Button("Aggiungi Servizio") {
                            aggiungiServizio()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.theme.primary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        
                    }
                    .padding()
                }
            }
            .navigationTitle("Servizi")
        }
    }
    
    private func aggiungiServizio() {
        
        guard let prezzoDouble = Double(prezzo),
              let durataInt = Int(durata) else { return }
        
        let nuovo = Servizio(
            nome: nome,
            prezzo: prezzoDouble,
            durata: durataInt
        )
        
        context.insert(nuovo)
        
        nome = ""
        prezzo = ""
        durata = ""
    }
    
    private func eliminaServizio(at offsets: IndexSet) {
        for index in offsets {
            context.delete(servizi[index])
        }
    }
}
