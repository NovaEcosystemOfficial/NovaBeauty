import SwiftUI
import FirebaseAuth
import SwiftData

struct SplashView: View {

    @EnvironmentObject var themeManager: ThemeManager
    @Query private var profili: [ProfiloAttivita]

    @State private var isActive = false
    @State private var scale: CGFloat = 0.8
    @State private var opacity: Double = 0

    var body: some View {

        if isActive {

            if Auth.auth().currentUser != nil {

                if let profilo = profili.first {

                    Group {
                        if profilo.tipoAttivita.isEmpty {
                            SceltaAttivitaView()
                        } else {
                            ContentView()
                        }
                    }
                    .onAppear {
                        themeManager.aggiornaTema(tipo: profilo.tipoAttivita)
                    }

                } else {
                    SceltaAttivitaView()
                }

            } else {
                LoginView()
            }

        } else {

            ZStack {

                Color.white
                    .ignoresSafeArea()

                VStack {

                    Spacer()

                    Image("logoSplash")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 260)
                        .scaleEffect(scale)
                        .opacity(opacity)

                    Spacer()

                    Text("Estetica & Benessere")
                        .foregroundColor(.gray)
                        .opacity(opacity)
                        .padding(.bottom, 40)
                }
            }
            .onAppear {

                withAnimation(.easeOut(duration: 1.2)) {
                    scale = 1.0
                    opacity = 1.0
                }

                DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                    isActive = true

                    
                }
            }
        }
    }
}
