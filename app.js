// === localStorage ===
function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return []; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ console.warn('localStorage недоступен'); }
}

// === +месяцы ===
function addMonths(date, n){
  const d=new Date(date); d.setMonth(d.getMonth()+ (+n)); return d.toISOString().slice(0,10);
}

// === рендер ===
function render(){
  const subs=getSubs().sort((a,b)=>new Date(a.nextPay)-new Date(b.nextPay));
  const rows=subs.map((s,idx)=>{
     const next=addMonths(s.nextPay,s.period);
     const days=Math.ceil((new Date(next)-new Date())/86400000);
     return `<tr>
               <td>${s.name}</td>
               <td>${s.price} ₽</td>
               <td>${next}</td>
               <td>${days<0?'просрочено':days+' дн'}</td>
               <td>${days<0?'❌':'✅'}</td>
               <td class="del" onclick="del(${idx})">🗑</td>
             </tr>`;
  }).join('');
  document.querySelector('#list tbody').innerHTML=rows||'<tr><td colspan="6">Нет подписок</td>';

  // статистика
  const total=subs.length;
  document.getElementById('totalSub').textContent=total;
  document.getElementById('totalYear').textContent=total?Math.round(subs.reduce((s,x)=>s+(+x.price)*(12/x.period),0)):0;
  document.getElementById('mostExpensive').textContent=total?subs.reduce((m,c)=>+c.price>+m.price?c:m).name:'-';

  // диаграмма
  const ctx=document.getElementById('chart');
  if(!ctx)return;
  if(window.myPie)window.myPie.destroy();
  window.myPie=new Chart(ctx,{
     type:'pie',
     data:{labels:subs.map(s=>s.name),datasets:[{data:subs.map(s=>+s.price),backgroundColor:['#6750a4','#9a7bc6','#c9b6e4','#e6d7f4','#f3edf7'],borderWidth:0}]},
     options:{responsive:true,plugins:{legend:{display:false}},cutout:'60%'}
  });
}

// === удаление ===
function del(idx){
  const subs=getSubs(); subs.splice(idx,1); setSubs(subs); render();
}

// === добавление ===
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('addForm');
  form.nextPay.value=new Date().toISOString().slice(0,10);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const {name,price,period,nextPay}=form;
    if(!name.value||!price.value||!nextPay.value){alert('Заполните все поля');return;}
    const subs=getSubs();
    subs.push({name:name.value.trim(),price:+price.value,period:+period.value,nextPay:nextPay.value});
    setSubs(subs);
    form.reset(); form.nextPay.value=new Date().toISOString().slice(0,10);
    render();
  });
  render();
});
