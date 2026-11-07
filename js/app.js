/* Interface da página única: tudo recalcula em tempo real a cada digitação. */
const KEY='p3d_single_v1',$=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)],
esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
money=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),pc=v=>(+v||0).toFixed(1).replace('.',',')+'%',uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pl=n=>({name:n,com:0,pay:0,fixed:0,extra:0,sub:0});
const DEF=()=>({set:{kwh:0,energyOn:true,depOn:true,maintOn:true,monthHours:0},costs:[],printers:[],materials:[],
 packs:['Caixa ou envelope','Plástico bolha','Fita adesiva','Etiquetas','Proteção interna','Outros materiais'].map((name,i)=>({id:'pk'+i,name,price:0})),
 plats:{shopee:pl('Shopee'),ml:pl('Mercado Livre'),own:pl('Loja própria')},products:[],
 cur:{name:'',printer:'',material:'',grams:0,h:0,min:0,loss:0,finish:0,labor:0,extra:0,ship:0,packs:[],plat:'shopee',margin:30,price:0,qty:0,goal:1000}});
function load(){const d=DEF();try{const o=JSON.parse(localStorage.getItem(KEY));if(!o)return d;for(const k of['set','plats','cur'])o[k]=Object.assign(d[k],o[k]);for(const k of['costs','printers','materials','packs','products'])if(!Array.isArray(o[k]))o[k]=d[k];return Object.assign(d,o)}catch(e){return d}}
let S=load();
const toast=(m,bad)=>{const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2500)};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Não foi possível salvar. Exporte um backup.',1)}};
const nf=(a,k,l)=>`<label>${l}<input ${a}="${k}" type=number step=any min=0 placeholder=0></label>`;
const LISTS={printers:{t:'Impressoras',f:[['name','Modelo','t'],['watts','Potência (W)','n'],['price','Valor de aquisição (R$)','n'],['life','Vida útil (h)','n'],['maint','Manutenção (R$/h)','n']],n:{name:'',watts:0,price:0,life:0,maint:0}},
 materials:{t:'Filamentos e materiais',f:[['type','Tipo','s'],['brand','Marca','t'],['weight','Peso do rolo (g)','n'],['price','Preço pago (R$)','n']],n:{type:'PLA',brand:'',weight:1000,price:0}},
 packs:{t:'Itens de embalagem',f:[['name','Item','t'],['price','Preço unitário (R$)','n']],n:{name:'',price:0}},
 costs:{t:'Custos fixos e variáveis',f:[['name','Descrição (internet, aluguel, mão de obra…)','t'],['type','Tipo','s'],['value','Valor (R$)','n'],['on','Ativo','b']],n:{name:'',type:'fixo',value:0,on:true}}};
const OPT={type:{printers:[],materials:['PLA','PETG','ABS','TPU','Resina','Personalizado'],costs:['fixo','variavel']}};
function row(l,it){const D=LISTS[l];return`<div class=li>${D.f.map(([k,lb,t])=>{const a=`data-l=${l} data-i=${it.id} data-f=${k}`;
 return t=='b'?`<label class=chk><input type=checkbox ${a} ${it[k]?'checked':''}>${lb}</label>`:`<label>${lb}${t=='s'?`<select ${a}>${OPT.type[l].map(o=>`<option ${o==it[k]?'selected':''}>${o}</option>`).join('')}</select>`:`<input ${a} ${t=='n'?'type=number step=any min=0':''} value="${esc(it[k]||'')}">`}</label>`}).join('')}${l=='materials'?`<span class=ppg data-id=${it.id}></span>`:''}<button class="ghost x" data-del=${l} data-i=${it.id}>Remover</button></div>`}
function lists(){for(const l in LISTS)$('#L_'+l).innerHTML=(S[l].length?'':'<p class=note>Nada cadastrado.</p>')+S[l].map(i=>row(l,i)).join('')+`<button class=ghost data-add=${l}>Adicionar</button>`;fill()}
function build(){
 $('#inputs').innerHTML=`<div class=card><h2>Produto a precificar</h2><div class=grid><label>Nome do produto<input data-c=name></label><label>Impressora<select data-c=printer id=sp></select></label><label>Material<select data-c=material id=sm></select></label>
 ${nf('data-c','grams','Gramas consumidas')}${nf('data-c','h','Tempo (horas)')}${nf('data-c','min','Tempo (minutos)')}${nf('data-c','loss','Desperdício (%)')}${nf('data-c','finish','Acabamento (R$)')}${nf('data-c','labor','Mão de obra (R$)')}${nf('data-c','extra','Outros custos (R$)')}</div>
 <p><button id=sv>Salvar este produto</button></p><div id=saved></div></div>
 <div class=card><h2>Embalagem e envio</h2><p class=note>Marque só o que usa neste produto. Nada marcado = sem custo de embalagem.</p><div id=pk></div>${nf('data-c','ship','Envio pago pelo vendedor (R$)')}</div>
 <div class=card><h2>Onde vender</h2><div class=seg id=plat></div><h3>Margem desejada</h3><div class=seg>${[20,30,40,50].map(m=>`<button class=ghost data-m=${m}>${m}%</button>`).join('')}</div><div class=grid>${nf('data-c','margin','Margem personalizada (%)')}${nf('data-c','price','Preço de venda praticado (R$, opcional)')}</div></div>`;
 $('#more').innerHTML=`<div class=card><h2>Comparador de plataformas</h2><div id=cmp class=tw></div></div>
 <div class=card><h2>Simulador de lucro</h2><div class=grid>${nf('data-c','qty','Unidades vendidas por mês')}${nf('data-c','goal','Meta de lucro mensal (R$)')}</div><div class=seg style="margin-top:8px">${[1000,2000,5000].map(g=>`<button class=ghost data-g=${g}>Meta ${money(g)}</button>`).join('')}</div><div id=sim></div></div>
 <details open><summary>Configurações gerais</summary><div class=grid style="margin-top:10px">${nf('data-s','kwh','Valor do kWh (R$)')}${nf('data-s','monthHours','Horas de impressão por mês (para ratear custos fixos)')}
 <label class=chk><input type=checkbox data-s=energyOn>Considerar energia elétrica</label><label class=chk><input type=checkbox data-s=depOn>Considerar depreciação da impressora</label><label class=chk><input type=checkbox data-s=maintOn>Considerar manutenção da impressora</label></div><h3>Custos fixos e variáveis</h3><p class=note>Fixo = valor mensal, rateado por horas de impressão. Variável = valor por peça.</p><div id=L_costs></div></details>
 <details><summary>Impressoras</summary><div id=L_printers></div></details><details><summary>Filamentos e materiais</summary><div id=L_materials></div></details><details><summary>Itens de embalagem</summary><div id=L_packs></div></details>
 <details><summary>Taxas das plataformas (você edita; não são valores oficiais)</summary>${Object.entries(S.plats).map(([k,p])=>`<h3>${p.name}</h3><div class=grid>${nf('data-p',k+'.com','Comissão (%)')}${nf('data-p',k+'.pay','Taxa de pagamento (%)')}${nf('data-p',k+'.fixed','Taxa fixa por pedido (R$)')}${nf('data-p',k+'.extra','Taxas adicionais (R$)')}${nf('data-p',k+'.sub','Frete subsidiado (R$)')}</div>`).join('')}</details>`}
function fill(){const o=(a,f)=>a.map(x=>`<option value=${x.id}>${esc(f(x))}</option>`).join('')||'<option value="">Cadastre em Configurações</option>';
 $('#sp').innerHTML=o(S.printers,x=>x.name||'(sem nome)');$('#sm').innerHTML=o(S.materials,x=>(x.type+' '+(x.brand||'')).trim());
 if(!S.printers.some(x=>x.id==S.cur.printer))S.cur.printer=S.printers[0]?.id||'';if(!S.materials.some(x=>x.id==S.cur.material))S.cur.material=S.materials[0]?.id||'';
 $('#sp').value=S.cur.printer;$('#sm').value=S.cur.material;S.cur.packs=S.cur.packs.filter(id=>S.packs.some(p=>p.id==id));
 $('#pk').innerHTML=S.packs.map(p=>`<label class=chk><input type=checkbox data-pk=${p.id} ${S.cur.packs.includes(p.id)?'checked':''}><span>${esc(p.name||'(sem nome)')}</span>${money(p.price)}</label>`).join('')||'<p class=note>Nenhum item cadastrado.</p>';
 $('#plat').innerHTML=Object.entries(S.plats).map(([k,p])=>`<button class="ghost ${k==S.cur.plat?'sel':''}" data-plat=${k}>${esc(p.name)}</button>`).join('');
 $$('.ppg').forEach(s=>{const m=S.materials.find(x=>x.id==s.dataset.id);s.textContent='Custo por grama: '+(Calc.ppg(m)).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:4})});
 $('#saved').innerHTML=S.products.length?'<h3>Produtos salvos</h3>'+S.products.map(p=>`<div class=row><span>${esc(p.cur.name||'(sem nome)')}</span><span><button class=ghost data-load=${p.id}>Carregar</button> <button class="ghost x" data-del=products data-i=${p.id}>Excluir</button></span></div>`).join(''):''}
function setForm(){$$('[data-c]').forEach(e=>{const v=S.cur[e.dataset.c];if(e.type=='number')e.value=v||'';else if(e.tagName!='SELECT')e.value=v??''});
 $$('[data-s]').forEach(e=>{const v=S.set[e.dataset.s];e.type=='checkbox'?e.checked=v:e.value=v||''});$$('[data-p]').forEach(e=>{const[k,f]=e.dataset.p.split('.');e.value=S.plats[k][f]||''})}
const R=(l,v,c='')=>`<div class="row ${c}"><span>${l}</span><b>${v}</b></div>`;
function draw(){const c=S.cur,b=Calc.parts(S,c.plat),rec=Calc.price(b,c.margin),min=Calc.price(b,0),used=c.price>0?c.price:rec,r=used!=null?Calc.at(b,used):null,nz=o=>Object.entries(o).filter(x=>x[1]>0).map(([k,v])=>R(k,money(v))).join('');
 $('#res').innerHTML=`<div class=card><h2>${esc(c.name||'Resultado')} · ${esc(b.P.name)}</h2>`+(rec==null?'<p class=warn>Inviável: taxas percentuais + margem somam 100% ou mais.</p>':`<div class=big><small>Preço recomendado (margem ${pc(c.margin)})</small><b>${money(rec)}</b></div>${R('Preço mínimo (sem prejuízo)',money(min))}`)
 +(c.price>0?`<p class=note>Lucro e margem abaixo usam seu preço praticado: ${money(c.price)}.</p>`:'')+`<h3>Custos</h3>${nz(b.prod)||'<p class=note>Preencha os dados do produto.</p>'}${nz(b.logi)}${r?R('Taxas da plataforma',money(r.fees)):''}${r?R('Custo total',money(b.base+r.fees),'t'):''}${r?R('Lucro líquido',money(r.profit),'t')+R('Margem de lucro',pc(r.margin),'t'):''}`
 +(!S.printers.length||!S.materials.length?'<p class=warn>Cadastre ao menos uma impressora e um material em Configurações.</p>':'')+(b.fixedMissingHours?'<p class=warn>Informe as horas de impressão por mês para ratear os custos fixos.</p>':'')+'</div>';
 $('#mini').innerHTML=`<span>Recomendado ${rec==null?'—':money(rec)}</span><span>Lucro ${r?money(r.profit):'—'}</span>`;
 const ks=Object.keys(S.plats),rs=ks.map(k=>used==null?null:Calc.at(Calc.parts(S,k),used)),bs=ks.map(k=>Calc.parts(S,k).base),best=rs.length&&used!=null?Math.max(...rs.map(x=>x.profit)):null;
 const rw=(l,f)=>`<tr><th>${l}</th>${rs.map((x,i)=>`<td class="${x&&x.profit==best?'best':''}">${x?f(x,i):'—'}</td>`).join('')}</tr>`;
 $('#cmp').innerHTML=used==null?'<p class=note>Defina uma margem viável.</p>':`<p class=note>Mesmo produto vendido a ${money(used)}. Verde = maior lucro.</p><table><tr><th></th>${ks.map(k=>`<th>${esc(S.plats[k].name)}</th>`).join('')}</tr>${rw('Taxas',x=>money(x.fees))}${rw('Custos',(x,i)=>money(bs[i]))}${rw('Você recebe (após taxas)',x=>money(x.net))}${rw('Lucro líquido',x=>money(x.profit))}${rw('Margem',x=>pc(x.margin))}</table>`;
 const lp=r?r.profit:0;$('#sim').innerHTML=r?`${R('Faturamento estimado',money(c.qty*used))}${R('Lucro mensal',money(c.qty*lp),'t')}${R('Peças necessárias para a meta',lp>0&&c.goal>0?Math.ceil(c.goal/lp)+' peças/mês':'—','t')}`:''}
document.addEventListener('input',e=>{const t=e.target,d=t.dataset,v=t.type=='checkbox'?t.checked:t.type=='number'?(isFinite(+t.value)&&+t.value>0?+t.value:0):t.value;
 if(d.c)S.cur[d.c]=v;else if(d.s)S.set[d.s]=v;else if(d.p){const[k,f]=d.p.split('.');S.plats[k][f]=v}else if(d.l)S[d.l].find(x=>x.id==d.i)[d.f]=v;
 else if(d.pk)S.cur.packs=v?[...S.cur.packs,d.pk]:S.cur.packs.filter(x=>x!=d.pk);else return;save();draw()});
document.addEventListener('change',e=>{if(e.target.dataset.l){fill();draw()}});
const dl=(n,t)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'application/json'}));a.download=n;a.click();URL.revokeObjectURL(a.href)};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.m){S.cur.margin=+d.m;setForm()}else if(d.g){S.cur.goal=+d.g;setForm()}else if(d.plat){S.cur.plat=d.plat;fill()}
 else if(d.add){S[d.add].push({id:uid(),...LISTS[d.add].n});lists()}
 else if(d.del){if(!confirm('Remover este item? Esta ação não pode ser desfeita.'))return;S[d.del]=S[d.del].filter(x=>x.id!=d.i);d.del=='products'?fill():lists();toast('Removido')}
 else if(d.load){S.cur={...DEF().cur,...S.products.find(x=>x.id==d.load).cur};fill();setForm();toast('Produto carregado')}
 else if(b.id=='sv'){if(!S.cur.name.trim())return toast('Dê um nome ao produto antes de salvar',1);const i=S.products.findIndex(p=>p.cur.name==S.cur.name),p={id:i<0?uid():S.products[i].id,cur:JSON.parse(JSON.stringify(S.cur))};i<0?S.products.push(p):S.products[i]=p;fill();toast('Produto salvo')}
 else if(b.id=='exp'){dl('3d-price-manager-backup.json',JSON.stringify(S,null,1));toast('Backup exportado')}else return;save();draw()});
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o.set||!o.plats||!o.cur)throw Error('arquivo inválido');if(!confirm('Substituir todos os dados atuais pelo backup?'))return;localStorage.setItem(KEY,JSON.stringify(o));S=load();build();lists();setForm();draw();toast('Backup importado')}catch(x){toast('Backup inválido',1)}};r.readAsText(f)};
const th=(()=>{try{return localStorage.getItem('p3d_theme')}catch(e){}})()||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=th;
$('#th').onclick=()=>{const t=document.documentElement.dataset.theme=='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('p3d_theme',t)}catch(e){}};
build();lists();setForm();draw();
