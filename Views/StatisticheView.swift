import SwiftUI
import SwiftData

struct StatisticheView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Query private var appuntamenti: [Appuntamento]
    
    var meseCorrente: [Appuntamento] {
        let calendar = Calendar.current
        return appuntamenti.filter {
            calendar.isDate($0.data, equalTo: Date(), toGranularity: .month)
        }
    }
    
    var incassoMensile: Double {
        meseCorrente.reduce(0) { $0 + $1.prezzo }
    }
    
    var numeroAppuntamenti: Int {
        meseCorrente.count
    }
    
    var clienteTop: String {
        let grouped = Dictionary(grouping: meseCorrente, by: { $0.cliente.nome })
        let sorted = grouped.sorted { $0.value.count > $1.value.count }
        return sorted.first?.key ?? "Nessuno"
    }
    
    var body: some View {
        ZStack {
            themeManager.theme.background
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                
                Text("Statistiche Mese")
                    .font(.title.bold())
                    .foregroundColor(themeManager.theme.primary)
                
                StatCard(
                    title: "Incasso Mensile",
                    value: "€ \(String(format: "%.2f", incassoMensile))"
                )

                StatCard(
                    title: "Appuntamenti",
                    value: "\(numeroAppuntamenti)"
                )

                StatCard(
                    title: "Cliente Top",
                    value: clienteTop
                )
                
                Spacer()
            }
            .padding()
        }
    }
}

struct StatCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    var title: String
    var value: String
    
    var body: some View {
        VStack(spacing: 8) { // 👈 FIX BUG QUI
                
            Text(title)
                .font(.headline)
                .foregroundColor(themeManager.theme.text)
            
            Text(value)
                .font(.title2.bold())
                .foregroundColor(themeManager.theme.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(themeManager.theme.card)
        .cornerRadius(20)
        .shadow(radius: 5)
    }
}
