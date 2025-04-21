const LOCAL_H = 12
const LOCAL_M = 0

const App = {
    data() {
     return {
         active: false,
         enabled: false,
         offset_d:  0,
         offset_h:  0,
         offset_m:  0,
         timeout_l: 0,
         timeout_r: 0,
         time:{ left: '00:00',
                remaining: '00:00',
                start: '00:00',
                end: '00:00',
                progress: 0,
                day_num: 0,
                day_str: '',
                },
         hours: [],
         hour:{current:0,
               mode:'час',
               num: 0,
               suffix:'',
               len: 0,
               },
         curriculum: [],

         hoursContainer: 0,
         minutesContainer: 0,
         secondsContainer: 0,
         tickElements: 0,
         last: 0,
         tickState: true,
         }
     },
    methods:{
        loadParams(){
            const vm = this;
            vm.enabled = true;
            axios.get('/proxy/params/')
            .then(function(response){
                for (param of response.data){
                    if((param.param_name=='учебен ден')&&(param.param_value=='не')){vm.enabled=false}
                    if(param.param_name=='отместване дни'){vm.offset_d=parseInt(param.param_value)}
                    if(param.param_name=='отместване часове'){vm.offset_h=parseInt(param.param_value)}
                    if(param.param_name=='отместване минути'){vm.offset_m=parseInt(param.param_value)}
                    }
                })
        },
        loadHours(){
            const vm = this;
            vm.timeout_l = 0;
            vm.timeout_r = 0;
            axios.get('/proxy/timeline/')
            .then(function(response){
                vm.hours=response.data
                })
        },
        loadCurriculum(){
            const vm = this;
            const ds = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя', ]
            vm.time.day_str = ds[vm.time.day_num]
            console.log(`ден ${vm.time.day_num}, час ${vm.hour.num}`)
            axios.get('/proxy/curriculum/'+vm.time.day_num+'/'+vm.hour.num+'/')

            .then(function(response){
                vm.curriculum=response.data
                if(vm.curriculum.length==0){vm.active=false}
                console.log('vm.curriculum.length='+vm.curriculum.length)
                })
        },
        clock(){
            let deg=6
            let hr=document.querySelector('#hr')
            let mn=document.querySelector('#mn')
            let sc=document.querySelector('#sc')
            let day = new Date()
            let dayNum=0
            dayNum=day.getDay() + 1 + this.offset_d
            if(dayNum>6){dayNum=0}
            this.time.day_num = dayNum

            let h_=(day.getHours()+this.offset_h+LOCAL_H)%24
            let m_=(day.getMinutes()+this.offset_m+LOCAL_M)%60
            let s_=day.getSeconds()

            this.timer()
            if (this.enabled&&(this.timeout_r==0)){this.setTrain(h_, m_)}
        },
        makeTimers(){
            function sT(n){
                let s = n % 60
                let m = Math.trunc(n / 60)
                let ss = s.toString()
                if (ss.length<2){ss = '0'+ss}
                let mm = m.toString()
                if (mm.length<2){mm = '0'+mm}
                return mm+':'+ss
                }
            let p=0
            this.time.left=sT(this.timeout_l)
            this.time.remaining=sT(this.timeout_r)
            if((this.timeout_l+this.timeout_r)>0){
                p=this.timeout_l*100
                p=p/(this.timeout_l+this.timeout_r)
                this.time.progress=Math.round(p)
                }
        },
        timer(){
            // върти таймера
            if (this.timeout_r>0){
                this.timeout_l += 1
                this.timeout_r -= 1
                this.makeTimers()
                }
        },
        setTrain(h,m){ // определя начало/край на междучасие/час h и m  са текущото време h:m
            function sT(n){
                let m = n % 60
                let h = Math.trunc(n / 60)
                let mm = m.toString()
                if (mm.length<2){mm = '0'+mm}
                let hh = h.toString()
                if (hh.length<2){hh = '0'+hh}
                return hh+':'+mm
                }
            // 1. определям дали е време да се смени час/междучасие
            this.hour.num=99
            this.hour.mode='междучасие'
            let p = 0
            let timeBefore = 0
            let timeBegin = 0
            let timeEnd = 0
            let timeNow=h*60+m // време в минути от 00:00 до този момент

            timeBefore = timeBegin - 20
            for(i=0; i<this.hours.length; i++){
                timeBegin = this.hours[i].start_h*60+this.hours[i].start_m;
                if(i==0){
                    timeBefore = timeBegin - 20
                    }
                else{
                    timeBefore=timeEnd
                    }
                timeEnd = this.hours[i].end_h*60+this.hours[i].end_m
                if((timeNow>=timeBefore)&&(timeNow<timeBegin)){//междучасие преди часа
                    this.active=true
                    this.hour.mode='междучасие'
                    this.hour.current=i
                    this.hour.num=this.hours[i].num
                    this.hour.suffix=this.hours[i].suffix
                    this.hour.len = timeBegin - timeBefore
                    this.timeout_l = (timeNow - timeBefore)*60;
                    this.timeout_r = (timeBegin - timeNow)*60;
                    this.time.start=sT(timeBefore)
                    this.time.end=sT(timeBegin)
                    this.loadCurriculum()
                }
                else if((timeNow>=timeBegin)&&(timeNow<timeEnd)){// час
                    this.active=true
                    this.hour.mode='час'
                    this.hour.current=i
                    this.hour.num=this.hours[i].num
                    this.hour.suffix=this.hours[i].suffix
                    this.hour.len = timeEnd - timeBegin
                    this.timeout_l = (timeNow - timeBegin)*60;
                    this.timeout_r = (timeEnd - timeNow)*60;
                    this.time.start=sT(timeBegin)
                    this.time.end=sT(timeEnd)
                    this.loadCurriculum()
                }
            }
            this.makeTimers()
        },

        dc_init(){
            this.hoursContainer = document.querySelector('.hours')
            this.minutesContainer = document.querySelector('.minutes')
            this.secondsContainer = document.querySelector('.seconds')
            this.tickElements = Array.from(document.querySelectorAll('.tick'))

            this.last = new Date(0)
            this.last.setUTCHours(-1)

            this.tickState = true

            setInterval(this.dc_updateTime, 100)
        },
        dc_updateTime () {
            var now = new Date

            var lastHours = this.last.getHours().toString()
            var nowHours = now.getHours().toString()
            if (lastHours !== nowHours) {
                this.dc_updateContainer(this.hoursContainer, nowHours)
            }

            var lastMinutes = this.last.getMinutes().toString()
            var nowMinutes = now.getMinutes().toString()
            if (lastMinutes !== nowMinutes) {
                this.dc_updateContainer(this.minutesContainer, nowMinutes)
            }

            var lastSeconds = this.last.getSeconds().toString()
            var nowSeconds = now.getSeconds().toString()
            if (lastSeconds !== nowSeconds) {
                //tick()
                this.dc_updateContainer(this.secondsContainer, nowSeconds)
                }

            this.last = now
        },
        dc_tick () {
            this.tickElements.forEach(t => t.classList.toggle('tick-hidden'))

            },
        dc_updateContainer (container, newTime) {
            var time = newTime.split('')

            if (time.length === 1) {
                time.unshift('0')
            }


            var first = container.firstElementChild
            if (first.lastElementChild.textContent !== time[0]) {
                this.dc_updateNumber(first, time[0])
            }

            var last = container.lastElementChild
            if (last.lastElementChild.textContent !== time[1]) {
                this.dc_updateNumber(last, time[1])
            }
        },
        dc_updateNumber (element, number) {
            //element.lastElementChild.textContent = number
            var second = element.lastElementChild.cloneNode(true)
            second.textContent = number

            element.appendChild(second)
            element.classList.add('move')

            setTimeout(function () {
                element.classList.remove('move')
            }, 990)
            setTimeout(function () {
                element.removeChild(element.firstElementChild)
            }, 990)
        },
    },
    created: function(){
        this.loadParams();
        this.loadHours();
        setInterval(() =>{this.clock()}, 1000)
        this.loadCurriculum()
        this.dc_init()
    }
}

Vue.createApp(App).mount('#app')