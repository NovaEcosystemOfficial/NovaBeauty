import SwiftUI
import SwiftData

struct DashboardView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Query private var appuntamenti: [Appuntamento]
    @State private var mostraNuovoAppuntamento = false
    
    var appuntamentiOggi: Int {
        appuntamenti.filter {
            Calendar.current.isDateInToday($0.data)
        }.count
    }
    
    var incassoOggi: Double {
        appuntamenti
            .filter { Calendar.current.isDateInToday($0.data) }
            .reduce(0) { $0 + $1.prezzo }
    }
    
    var body: some View {
        ZStack {
            themeManager.theme.background
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                
                Text("Beauty_Souls")
                    .font(.largeTitle.bold())
                    .foregroundColor(themeManager.theme.primary)
                
                VStack(spacing: 10) {
                    
                    Text("Appuntamenti Oggi")
                        .font(.headline)
                        .foregroundColor(themeManager.theme.text)
                    
                    Text("\(appuntamentiOggi)")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(themeManager.theme.secondary)
                    
                    Text("Incasso € \(incassoOggi, specifier: "%.2f")")
                        .font(.subheadline)
                        .foregroundColor(themeManager.theme.text.opacity(0.7))
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(themeManager.theme.card)
                .cornerRadius(20)
                .shadow(radius: 5)
                
                Button("Nuovo Appuntamento") {
                    mostraNuovoAppuntamento = true
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(themeManager.theme.primary)
                .foregroundColor(.white)
                .cornerRadius(15)
                
                Button {
                    let username = "kekkaeciro2018"
                    
                    if let appURL = URL(string: "tiktok://user?username=\(username)"),
                       UIApplication.shared.canOpenURL(appURL) {
                        UIApplication.shared.open(appURL)
                    } else if let webURL = URL(string: "https://www.tiktok.com/@\(username)") {
                        UIApplication.shared.open(webURL)
                    }
                } label: {
                    HStack {
                        Image(systemName: "video.fill")
                        Text("Vai su TikTok")
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.black)
                    .foregroundColor(.white)
                    .cornerRadius(15)
                }
                
                Spacer()
            }
            .padding()
        }
        .sheet(isPresented: $mostraNuovoAppuntamento) {
            NuovoAppuntamentoView()
        }
    }
}
