// === localStorage ===
function getSubs(){ return JSON.parse(localStorage.getItem('subs')||'[]'); }
function setSubs(list){ localStorage.setItem('subs',JSON.stringify(list)); }

// === +1 месяц ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === рендер с плавным появлением ===
function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,1);
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const status = daysLeft < 0 ? '❌' : '✅';
      return `<tr style="animation:fadeIn .4s">
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
                <td class="status">${status}</td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="6">Подписок пока нет</td></tr>';
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
  const {name,price,nextPay} = addForm;
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};

document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});
