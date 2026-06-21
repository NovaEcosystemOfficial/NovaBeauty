import SwiftUI

struct SplashView: View {
    @EnvironmentObject private var session: AuthSessionManager

    @State private var isActive = false
    @State private var scale: CGFloat = 0.8
    @State private var opacity: Double = 0

    var body: some View {

        if isActive {
            if session.isLoading {
                ProgressView("Caricamento…")
            } else if session.user != nil {
                ContentView()
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
