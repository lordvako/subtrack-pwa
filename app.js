// === localStorage ===
function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return []; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ console.warn('localStorage недоступен'); }
}

// === +N месяцев ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + (+n));
  return d.toISOString().slice(0,10);
}

// === рендер таблицы ===
function render(){
  const subs = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay));

  const rows = subs
    .map((s,idx)=>{
      const next     = addMonths(s.nextPay, s.period);
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const status   = daysLeft < 0 ? '❌' : '✅';
      return `<tr style="animation:fadeIn .4s">
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
                <td class="status">${status}</td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');

  const tbody = document.querySelector('#list tbody');
  if(tbody) tbody.innerHTML = rows || '<tr><td colspan="6">Подписок пока нет</td></tr>';

  updateStats();
  drawChart();
}

// === удаление ===
function del(idx){
  const subs = getSubs();
  subs.splice(idx,1);
  setSubs(subs);
  render();
}

// === статистика (3 показателя) ==========
function updateStats(){
  const subs = getSubs();
  const total    = subs.length;
  const yearCost = total ? Math.round(subs.reduce((s,x)=>s+ (+x.price)*(12/(+x.period)),0)) : 0;
  const avgDays  = total ? Math.round(subs.reduce((s,x)=>{
                     const next = addMonths(x.nextPay,x.period);
                     return s+Math.max(0,Math.ceil((new Date(next)-new Date())/86400000));
                   },0)/total) : 0;
  let mostExpName = '-';
  if(total) mostExpName = subs.reduce((max,cur)=> (+cur.price) > (+max.price) ? cur : max).name;

  ['totalSub','totalYear','mostExpensive']
    .forEach(id=>{
      const el=document.getElementById(id);
      if(el){
        el.textContent=
          id==='mostExpensive'?mostExpName
                             :{totalSub:total,totalYear:yearCost}[id];
      }
    });
}

// === диаграмма ===
function drawChart(){
  const canvas=document.getElementById('chart');
  if(!canvas) return;
  const subs=getSubs();
  if(!subs.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const ctx=canvas.getContext('2d');
  if(window.myPie)window.myPie.destroy();
  window.myPie=new Chart(ctx,{
    type:'pie',
    data:{
      labels:subs.map(s=>s.name),
      datasets:[{data:subs.map(s=>+s.price),
                 backgroundColor:['#6750a4','#9a7bc6','#c9b6e4','#e6d7f4','#f3edf7'],
                 borderWidth:0}]
    },
    options:{responsive:true,plugins:{legend:{display:false}},cutout:'60%'}
  });
}

// === добавление подписки ===
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('addForm');
  if(form){
    form.nextPay.value=new Date().toISOString().slice(0,10);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const {name,price,period,nextPay}=form;
      if(!name.value||!price.value||!nextPay.value){alert('Заполните все поля!');return;}
      const subs=getSubs();
      subs.push({name:name.value.trim(),price:+price.value,period:+period.value,nextPay:nextPay.value});
      setSubs(subs);
      form.reset();
      form.nextPay.value=new Date().toISOString().slice(0,10);
      render();
    });
  }
  render();
});
