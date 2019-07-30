const $precos = document.querySelector('#precos');
const $registros = document.querySelector("#registros");
const $registros2 = document.querySelector("#registros2")
const $fechar = document.querySelector("#fechar");
const $modal = document.querySelector(".conteiner-modal");
const $comprovante = document.querySelector(".conteiner-comprovante");
const $btn_comp = document.querySelector("#btn_comp");
const $comp_modelo = document.querySelector("#comp_modelo");
const $comp_placa = document.querySelector("#comp_placa");
const $comp_data = document.querySelector("#comp_data");
const $comp_hora = document.querySelector("#comp_hora");
const $modelo = document.querySelector("#modelo");
const $placa = document.querySelector('#placa');
const $add = document.querySelector('#adicionar');
const $cancelar = document.querySelector("#cancelar");
const $cancelar2 = document.querySelector("#cancelar2");
const $salvar = document.querySelector("#salvar");
const $primeiraHora = document.querySelector("#primeiraHora");
const $demaisHoras = document.querySelector("#demaisHoras");
const $btnRelatorio = document.querySelector("#btn_relatorio");
const $relatorio = document.querySelector(".conteiner-relatorio")
const $close = document.querySelector("#close")
const $valor = document.querySelector("#valor")
const $editar = document.querySelector(".conteiner-editar")
let carroEditar;
const pipe = (...fns) => arg => fns.reduce((val, fn) => fn(val), arg);

const abrirModal = (el) => el.classList.add("exibirModal");

const fecharModal = (el) => el.classList.remove("exibirModal");

const novoCadastro = () => abrirModal($modal);

const fechar = () => {
    fecharModal($modal);
    fecharModal($comprovante);
    fecharModal($relatorio)
    fecharModal($editar)
}

// ** Função para limitar número de caracteres nos campos de input
const limitarCaracteres = () => {
    $modelo.maxLength = 60;
    $placa.maxLength = 8;
    $primeiraHora.maxLength = 6;
    $demaisHoras.maxLength = 6;
}

limitarCaracteres();

function horaAtualFormatada(){
    var data = new Date(),
        hora = data.getHours(),
        horaF = hora<10 ? "0" + hora : hora;
        min = data.getMinutes(),
        minF = min<10 ? "0" + min : min;
    return horaF+":"+minF;
}

function dataAtualFormatada(){
    // Obtém a data/hora atual
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return diaF+"/"+mesF+"/"+anoF;
}

const cadastrarVeiculo = () => {
    if($add.textContent == "Adicionar"){
        var data = new Date();
        var modeloCarro = $modelo.value;
        var placaCarro = $placa.value;

        carro = {
            modelo: modeloCarro,
            placa: placaCarro,
            data: dataAtualFormatada(),
            data_saida: "",
            milissegundosEntrada:parseInt(data.getTime()),
            hora: horaAtualFormatada()
        }

        if(!modeloCarro && !placaCarro){
            alert('Preencha os campos em branco!')
            return false;
        }
        if(validarPlaca($placa.value)){
            if(localStorage.getItem('patio') == null){
                var carros = [];
                carros.push(carro);
                localStorage.setItem('patio', JSON.stringify(carros));
            }else{
                var carros = JSON.parse(localStorage.getItem('patio'));
                carros.push(carro);
                localStorage.setItem('patio', JSON.stringify(carros));
            }
            abrirComprovante(carro.placa,carro.modelo,carro.data,carro.hora)
        }else{
            alert("Digite uma placa no formato aaa-0000")
        }
       
    }else if($add.textContent == "Atualizar"){
        atualizarRegistro(carroEditar);
    }

    mostraPatio();
}

const abrirComprovante = (placa, modelo, data, hora) => {
    var carros = JSON.parse(localStorage.getItem('patio'));

    $comp_modelo.innerHTML = '';
    $comp_placa.innerHTML = '';
    $comp_data.innerHTML = '';
    $comp_hora.innerHTML = '';

    for(var i = 0 ; i < carros.length; i++){
		if(carros[i].placa == placa){
			$comp_modelo.innerHTML += modelo;
            $comp_placa.innerHTML += placa;
            $comp_data.innerHTML += data;
            $comp_hora.innerHTML += hora;
		}
    }
    abrirModal($comprovante);
}

function mostraRelatorio(){
    var carros = JSON.parse(localStorage.getItem('patio'));
    $registros2.innerHTML = '';

        carros.filter(carros => carros.data_saida != "")
        .map(carros =>{
            $tr = document.createElement("tr")
            placa = carros.placa;

            $registros2.innerHTML += `<td>${carros.modelo}
                            </td><td id="td_placa">${carros.data+" "+carros.hora}
                            </td><td>${carros.data_saida+" "+carros.hora_saida}
                            </td><td>`+calcularTempoEValor(carros.placa)+
                            "</td>";
            $registros2.insertBefore($tr,null);
    });
}

const abrirRelatorio = () => {
    mostraRelatorio();
    abrirModal($relatorio);
}

function editarCarro(data){
    var carros = JSON.parse(localStorage.getItem('patio'));
    const indice = carros.findIndex(rs => rs.data == data);
    $modelo.value = carros[indice].modelo
    $placa.value = carros[indice].placa
    carroEditar = carros[indice].placa
    $add.textContent = "Atualizar";
}

const atualizarRegistro = (placa) =>{
    var carros = JSON.parse(localStorage.getItem('patio'));
    const indice = carros.findIndex(rs => rs.placa == placa);

    const registro = {
        modelo: $modelo.value,
        placa: $placa.value,
        data: carros[indice].data,
        milissegundosEntrada: carros[indice].milissegundosEntrada,
        milissegundosSaida: carros[indice].milissegundosSaida,
        data_saida: carros[indice].data_saida,
        hora_saida: carros[indice].hora_saida,
        hora: carros[indice].hora,
    }
    carros.splice(indice, 1, registro);

    const jsonBanco = JSON.stringify(carros);
    localStorage.setItem("patio",jsonBanco);

    $add.textContent="Adicionar";
    $placa.value = "";
    $modelo.value="";
}

const excluirCarro = (placa) =>{
    var precos = JSON.parse(localStorage.getItem('preco'))

    var preco = [];

    preco = precos ? precos : [];

    let ultimo = preco.length -1;
    if(ultimo != -1){
        var data = new Date();
        var carros = JSON.parse(localStorage.getItem('patio'));
        const indice = carros.findIndex(rs => rs.placa == placa);

        const registro = {
            modelo: carros[indice].modelo,
            placa: carros[indice].placa,
            data: carros[indice].data,
            milissegundosEntrada: carros[indice].milissegundosEntrada,
            milissegundosSaida: parseInt(data.getTime()),
            data_saida: dataAtualFormatada(),
            hora_saida: horaAtualFormatada(),
            hora: carros[indice].hora,
        }
        carros.splice(indice, 1, registro);

        const jsonBanco = JSON.stringify(carros);
        localStorage.setItem("patio",jsonBanco);
        mostraPatio();
    }else{
        alert("Digite um preço!!!")
    }
}

const calcularTempoEValor = (placa) =>{
    var carros = JSON.parse(localStorage.getItem('patio'));
    const indice = carros.findIndex(rs => rs.placa == placa);
    var dataEntradaDate = carros[indice].milissegundosEntrada;
    var dataSaidaDate = carros[indice].milissegundosSaida;

    milissegundos = dataSaidaDate - dataEntradaDate;

    var hora = milissegundos / 1000 / 60 / 60;
    var minuto = milissegundos / 1000 / 60;

    tolerancia = 0;

    if(minuto > tolerancia) {
        hora += 1;
    }else if(minuto > hora * 60){
        if((minuto - hora * 60) > tolerancia){
            hora +=1
        }
    }
    hora = Math.floor(hora)

    var precos = JSON.parse(localStorage.getItem('preco'));


    var precoPrimeiraHora = parseFloat(precos[0].primeiraHora);
    var precoDemaisHoras = parseFloat(precos[0].demaisHoras);
    var valorPagar = 0.0;

    if(hora ==1){
        valorPagar = precoPrimeiraHora
    }else if(hora >= 2){
        valorPagar = precoPrimeiraHora + ((hora - 1) * precoDemaisHoras)
    }

    console.log(valorPagar)
    return valorPagar;
}

function mostraPatio(){
    var carros = JSON.parse(localStorage.getItem('patio'));
    $registros.innerHTML = '';

        carros.filter(carros => carros.data_saida == "")
        .map(carros =>{
            $tr = document.createElement("tr")

            $registros.innerHTML += `<td>${carros.modelo}
                            </td><td id="td_placa">${carros.placa}
                            </td><td>${dataAtualFormatada()}
                            </td><td>${carros.hora}
                            <td><button class="acoes" id="btn_comp" onclick='abrirComprovante("${carros.placa}","${carros.modelo}","${dataAtualFormatada()}","${carros.hora}")'>Comp.</button>
                            <button class="acoes editar" onclick='editarCarro("${carros.data}")'>Editar</button>
                            <button class="acoes excluir" onclick='excluirCarro("${carros.placa}")'>Excluir</button></td>
                            </td>`;
            $registros.insertBefore($tr,null);
    });
}

const cadastrarPreco = () =>{
    var primeiraHora = $primeiraHora.value;
    var demaisHoras = $demaisHoras.value;

    preco = {
        primeiraHora: primeiraHora,
        demaisHoras: demaisHoras 
    }

    if(!primeiraHora && !demaisHoras){
        alert('Preencha os campos em branco!')
        return false;
    }

    if(localStorage.getItem('preco') == null){
        var precos = [];
        precos.push(preco);
        localStorage.setItem('preco', JSON.stringify(precos));
    }else{
        var precos = JSON.parse(localStorage.getItem('preco'));
        precos.splice(0,1,preco);
        localStorage.setItem('preco', JSON.stringify(precos));
    }
}

const validarNumeros = texto => texto.replace(/[^0-9]/g, "")
const validarTextos = texto => texto.replace(/[^A-Za-zÀ-ÿ ]/g, "")
const filtroPlaca = texto => texto.replace(/[^A-Za-zÀ-ÿ0-9]/g, "")

const validarPlaca = el => /[a-zA-Z]{3}-[0-9]{4}/g.test(el);

const adicionarHifen = texto => texto.replace(/(.{3})(.)/, "$1-$2"); 
const trocarParaMaiuscula = texto => texto.toUpperCase();

const adicionarVirgula = numero => numero.replace(/(.*)(.{2})/, "$1,$2")
                                    .replace(/(.*)(.{6})/, "$1.$2");

const mascaraPreco = pipe(validarNumeros, adicionarVirgula);

const mascaraPlaca = pipe(filtroPlaca, trocarParaMaiuscula, adicionarHifen );

$modelo.addEventListener("keyup", () => $modelo.value = validarTextos($modelo.value));
$placa.addEventListener("keyup", () => $placa.value = mascaraPlaca($placa.value));
$primeiraHora.addEventListener("keyup", () => $primeiraHora.value = mascaraPreco($primeiraHora.value));
$demaisHoras.addEventListener("keyup", () => $demaisHoras.value = mascaraPreco($demaisHoras.value));

$precos.addEventListener("click", novoCadastro)
$fechar.addEventListener("click", fechar);
$cancelar.addEventListener("click", fechar);
$cancelar2.addEventListener("click", fechar);
$add.addEventListener("click", cadastrarVeiculo);
$salvar.addEventListener("click", cadastrarPreco);
$btnRelatorio.addEventListener("click", abrirRelatorio)
$close.addEventListener("click", fechar)
