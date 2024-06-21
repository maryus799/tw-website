// Incarcare intregii paginii (a tuturor resurselor) si apoi lansarea functiei
window.addEventListener("load", function () {

    // bara pret
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`
    }


    // butonul filtrare
    document.getElementById("filtrare").onclick = function () {

        // valoare introdusa la nume
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpDescriere = document.getElementById("inp-descriere").value.toLowerCase().trim();

        // colectare cuvinte cheie input
        let plusKeywords = [];
        let minusKeywords = [];


        inpDescriere.split(' ').forEach(keyword => {
            if (keyword.startsWith('+')) {
                plusKeywords.push(keyword.slice(1));
            } else if (keyword.startsWith('-')) {
                minusKeywords.push(keyword.slice(1));
            }
        });
        console.log(plusKeywords);
        console.log(minusKeywords);

        // elementele selectate prin radio Button pt durata realizare
        var radioRealizare = document.getElementsByName("gr_rad")
        let inpRealizare;
        for (let rad of radioRealizare) {
            if (rad.checked) {
                inpRealizare = rad.value;
                break;
            }
        }
        let minRealizare, maxReaalizare
        if (inpRealizare != "toate") {
            vCal = inpRealizare.split(":")
            minRealizare = parseInt(vCal[0])
            maxReaalizare = parseInt(vCal[1])
        }

        // elemente selectate radio Button pt tipuri produse
        var tipuri = document.getElementsByName("gr_rad2")
        let inpTip;
        for (let tip of tipuri) {
            if (tip.checked) {
                inpTip = tip.value;
                break;
            }
        }

        // preluare inputuri pret si categorie si transformare
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCateg = document.getElementById("inp-categorie").value;
        


        // preluare dater din BD si verificare conditii
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {

            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim()
            let cond1 = valNume.startsWith(inpNume)

            let valRealizare = parseInt(produs.getElementsByClassName("val-realizare")[0].innerHTML)
            let cond2 = (inpRealizare == "toate" || (minRealizare <= valRealizare && valRealizare < maxReaalizare));

            let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
            let cond3 = (valPret > inpPret)

            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerHTML
            let cond4 = (inpCateg == valCategorie || inpCateg == "toate")

            let valDescriere = produs.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase().trim()

            let val1 = true;
            let val2 = true;
            for (let word of plusKeywords) {
                if (valDescriere.includes(word)) {
                    val1 = true;
                    break;
                }
                else {
                    val1 = false;
                }
            }

            for (let word of minusKeywords) {
                if (valDescriere.includes(word)) {
                    val2 = false;
                    break;
                }
                else {
                    val2 = true;
                }
            }

            let cond5 = (val1 && val2)

            let valTip = produs.getElementsByClassName("val-tip")[0].innerHTML
            let cond6 = (inpTip == valTip || inpTip == "toate")

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6) {
                produs.style.display = "block";
            }
            else {
                produs.style.display = "none";
            }
        }
    }


    // Buton de resetare
    document.getElementById("resetare").onclick = function () {

        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-descriere").value = "";
        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("i_rad8").checked = true;
        document.getElementById("i_rad4").checked = true;
        var produse = document.getElementsByClassName("produs");
        document.getElementById("infoRange").innerHTML = "(0)";
        for (let prod of produse) {
            prod.style.display = "block";
        }
    }

    // Sortare dupa doua filtre pret si apoi nume
    function sorteaza(semn) {
        var produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse)
        v_produse.sort(function (a, b) {
            let pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML)
            let pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML)
            if (pret_a == pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        })
        console.log(v_produse)
        for (let prod of v_produse) {
            prod.parentNode.appendChild(prod)
        }

    }

    // Butoane sortare crescator, respectiv descrescator
    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1)
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1)
    }


    // Buton Alt + C
    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                var stil = getComputedStyle(produs)
                if (stil.display != "none") {
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
                }
            }
            if (!document.getElementById("par_suma")) {
                let p = document.createElement("p")
                p.innerHTML = suma;
                p.id = "par_suma";
                container = document.getElementById("produse")
                container.insertBefore(p, container.children[0])
                setTimeout(function () {
                    var pgf = document.getElementById("par_suma")
                    if (pgf)
                        pgf.remove()
                }, 2000)
            }

        }
    }

    // Validare textare
    const textarea = document.getElementById('inp-descriere');
    const validationMessage = document.getElementById('validationMessage');

    textarea.addEventListener('input', function() {
      const value = textarea.value.trim();
      if (value[0] == '+' || value[0] == '-') { 
          textarea.classList.remove('is-invalid');
          validationMessage.textContent = '';
      } else {
          textarea.classList.add('is-invalid');
          validationMessage.textContent = 'Cuvintele cheie vor fi de forma "+cuv -cuv"';
      }
    });

})
