// === localStorage ===
function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return []; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ console.warn('localStorage недоступен'); }
}

// === +1 месяц ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === формат дд.мм.гг ==========
function fmtDate(iso){
  const d=new Date(iso);
  const dd=String(d.getDate()).padStart(2,'0');
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const yy=String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

// === рендер таблицы ===
function render(){
  const subs=getSubs().sort((a,b)=>new Date(a.nextPay)-new Date(b.nextPay));
  const rows=subs.map((s,idx)=>{
    const next     =addMonths(s.nextPay,1);
    const daysLeft =Math.ceil((new Date(next)-new Date())/86400000);
    const status   =daysLeft<0?'❌':'✅';
    // обрезаем длинное название
    const nameCut=s.name.length>12?s.name.slice(0,12)+'…':s.name;
    return `<tr data-idx="${idx}" style="animation:fadeIn .4s">
              <td>${nameCut}</td>
              <td>${s.price} ₽</td>
              <td>${fmtDate(next)}</td>
              <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
              <td class="status">${status}</td>
            </tr>`;
  }).join('');
  const tbody=document.querySelector('#list tbody');
  if(tbody)tbody.innerHTML=rows||'<tr><td colspan="5">Подписок пока нет</td></tr>';
  updateStats();
  drawChart();
}

// ===== свайп-удаление =====
let touchStartX=0,touchEndX=0;
document.addEventListener('touchstart',e=>touchStartX=e.changedTouches[0].screenX,{passive:true});
document.addEventListener('touchend',e=>{
  touchEndX=e.changedTouches[0].screenX;handleSwipe(e.target);
},{passive:true});
function handleSwipe(el){
  const row=el.closest('tr');if(!row)return;
  const deltaX=touchStartX-touchEndX;if(deltaX<80)return;
  const idx=row.dataset.idx;if(idx===undefined)return;
  row.style.transition='transform .3s';row.style.transform='translateX(-110%)';
  setTimeout(()=>{
    const subs=getSubs();subs.splice(idx,1);setSubs(subs);render();
  },300);
}

// === статистика (3 пункта) + ₽ в МЕСЯЦ ==========
function updateStats(){
  const subs=getSubs();
  const total=subs.length;
  const monthCost=total?Math.round(subs.reduce((s,x)=>s+(+x.price),0)):0;
  let mostExpName='-';
  if(total)mostExpName=subs.reduce((max,cur)=>(+cur.price)>(+max.price)?cur:max).name;

  document.getElementById('totalSub').textContent=total;
  document.getElementById('monthCost').textContent=monthCost;
  document.getElementById('mostExpensive').textContent=mostExpName;
}

// === диаграмма с подписями цветов ==========
function drawChart(){
  const canvas=document.getElementById('chart');
  if(!canvas)return;
  const subs=getSubs();
  if(!subs.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const ctx=canvas.getContext('2d');
  if(window.myPie)window.myPie.destroy();

  // подписи под диаграммой
  const labels=subs.map(s=>s.name);
  const data  =subs.map(s=>+s.price);
  const colors=['#ff8c00','#ffa500','#ffb84d','#ffd27f','#ffedb3'];

  window.myPie=new Chart(ctx,{
    type:'pie',
    data:{
      labels:labels,
      datasets:[{data:data,backgroundColor:colors,borderWidth:0}]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#fff',font:{size:12},padding:10}},
        tooltip:{enabled:true,backgroundColor:'rgba(0,0,0,.7)',titleColor:'#fff',bodyColor:'#fff'}
      },
      cutout:'60%'
    }
  });
}

// === добавление подписки ===
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('addForm');
  if(form){
    form.nextPay.value=new Date().toISOString().slice(0,10);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const {name,price,nextPay}=form;
      if(!name.value||!price.value||!nextPay.value){alert('Заполните все поля!');return;}
      const subs=getSubs();
      subs.push({name:name.value.trim(),price:+price.value,nextPay:nextPay.value});
      setSubs(subs);
      form.reset();
      form.nextPay.value=new Date().toISOString().slice(0,10);
      render();
    });
  }
  render();
});
