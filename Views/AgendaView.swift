import SwiftUI
import SwiftData

struct AgendaView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Query(sort: \Appuntamento.data) private var appuntamenti: [Appuntamento]
    
    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                List {
                    
                    ForEach(Array(appuntamenti.enumerated()), id: \.element.id) { _, appuntamento in
                        
                        VStack(alignment: .leading, spacing: 6) {
                            
                            HStack {
                                Text(appuntamento.cliente.nome)
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
    }
    
    private func elimina(at offsets: IndexSet) {
        for index in offsets {
            context.delete(appuntamenti[index])
        }
        try? context.save()
    }
}
