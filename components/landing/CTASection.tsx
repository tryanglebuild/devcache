import Image from 'next/image'

export default function CTASection() {
  return (
    <section className="py-32 px-6 md:px-12 relative overflow-hidden section-surface">
      <div className="absolute inset-0 primary-gradient opacity-10" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10 glass-panel p-16 rounded-[3rem] ghost-border-strong">
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">
          Start Building Your Cache.
        </h2>
        <p className="text-xl mb-12 max-w-xl mx-auto text-on-surface-variant">
          Join 500+ engineering teams accelerating their release cycles with centralized technical wisdom.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="btn-primary px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl">
            Get devCache Today
          </button>
          
          <div className="text-left">
            <div className="flex -space-x-2">
              <Image 
                alt="User avatar" 
                className="w-8 h-8 rounded-full border-2 border-background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUevvMB7nDR6VNzoKLWsp-zZvYVC9dPRxA9Lpm9bmT43ukRUPbX5lhN4_QWkFxfMDYbGCaDyHYR1Je1I_kOymTI5KwUzdsKypN96PjNH4aGRbe8QVCgjMKJpCjvbYwOeWmlxfgL9JQfUNVefJDUJI8rvwLwWg-XspJ3hG7F_R9U2igplxDJY92gi2uH8_VVOVFg7VDeGEnaureiCkLOaB8J2-_9yhoQd6-r_VIM7PORz7VDvRg_zkYInT0sUn2BA2W8iIVT7T9uNwG"
                width={32}
                height={32}
              />
              <Image 
                alt="User avatar" 
                className="w-8 h-8 rounded-full border-2 border-background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQU3ikA17YO-WKvLhnjpMaUS9arYfq8kWGcTpL5GNQjZ-4XKNo3kuTiuKA0dFazn0MR--kIsomwRMMphPO3XES4uW8NgqH2I68E4dhigqvjX4rj-0YRs0bRDdjaUR5jqd5aSCFVsxN4aKrWgxevC1LA3D0ubjh_5jgg6Ry-ZBj2mN5Zncd0AT22fCZQ4EskLtWs3HrHEAxCmcH1-lBdR3ou4WjH3FTn0PPygFERbEYZWHx9NsttI-Z38lVZzp5J4jMpj3UGdownaxc"
                width={32}
                height={32}
              />
              <Image 
                alt="User avatar" 
                className="w-8 h-8 rounded-full border-2 border-background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiXdiHPRa3rMygPA0p--A-H-lNw72Y77MLCWXOIVSyntcdzHQkpMTroqxNsSwBGWD1Eedc-X9IkELOctCCwrHE4Asx1fKtYS0oYaICfNwkHux0Zm8WUaEFdux2refJyBRWKzfs98rIq1ZI4jm17OTfYN0HwpbHvfCkqELRkkwUVTgzklT5IE60RcHn-flSkWYDRP_pc9EwrZ54K5teeMAAZ6UKmifI0pK_fdpVun3FpAYznNNrlY1MvX5gIZYZeXm4L4Osv-Vo4Ryl"
                width={32}
                height={32}
              />
            </div>
            <p className="text-xs mt-2 text-on-surface-variant">
              <span className="font-bold text-on-surface">Trusted</span> by teams at Vercel, Stripe, and Figma.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
