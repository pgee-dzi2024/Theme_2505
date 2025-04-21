const App = {
    data() {
     return {
         spec: ['Приложно програмиране',
         'Системно програмиране',
         'Компютърна техника и технологии',
         'Електрически превозни средства',
         'Възобновяеми енергийни източници',
         ],
         spec_style:['0', '1', '2', '3', '4'],
         spec_num: 0,
         spec_show: '',

         offset_h: 0,
         offset_m: 0,
         }
     },
    methods:{
        clock(){
            let deg=6
            let hr=document.querySelector('#hr')
            let mn=document.querySelector('#mn')
            let sc=document.querySelector('#sc')
            let day = new Date()

            let h_=(day.getHours()+this.offset_h)%24
            let m_=(day.getMinutes()+this.offset_m)%60
            let s_=day.getSeconds()

            let hh=h_*30
            let mm=m_*deg
            let ss=s_*deg

            hr.style.transform = `rotateZ(${(hh)+(mm/12)}deg)`
            mn.style.transform = `rotateZ(${mm}deg)`
            sc.style.transform = `rotateZ(${ss}deg)`

            if (s_%10==0){
                this.spec_num++
                if (this.spec_num > 4){ this.spec_num=0 }
                }
        },
    },
    created: function(){
        setInterval(() =>{this.clock()}, 1000)
    }
}

Vue.createApp(App).mount('#app')