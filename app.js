// === localStorage ===
function getSubs(){ return JSON.parse(localStorage.getItem('subs')||'[]'); }
function setSubs(list){ localStorage.setItem('subs',JSON.stringify(list)); }

// === добавить N месяцев ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === красиво «осталось» ===
function prettyDays(d){
  if(d<0) return 'просрочено';
  if(d===0) return 'сегодня';
  if(d===1) return 'завтра';
  return `через ${d} дн.`;
}

// === рендер таблицы ===
function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay, +s.period);   // учитываем период
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const overdue = daysLeft < 0;
      return `<tr class="${overdue ? 'overdue' : ''}">
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td><div>${next}</div><div class="next">${prettyDays(daysLeft)}</div></td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="4">Подписок пока нет</td></tr>';
}

// === удаление ===
function del(idx){
  const subs = getSubs();
  subs.splice(idx,1);
  setSubs(subs);
  render();
}

// === добавление ===
addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,period,nextPay} = addForm;
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, period:period.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};

// === старт ===
document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});
