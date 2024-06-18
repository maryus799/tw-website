const express = require("express");
const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');

const Client = require('pg').Client;

var client= new Client({database:"tw_proiect",
        user:"marius",
        password:"marius",
        host:"localhost",
        port:5432});
client.connect();
 
obGlobal = {
    obErori: null,
    obImagini:null,
    folderScss:path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup"),
}

vect_foldere=["temp", "temp1", "backup"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
 
app.set("view engine","ejs");
 
app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.get(["/", "/home", "/index"], function(req,res){
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
})

app.get("/domnitori", function(req,res){
    res.render("pagini/domnitori", {imagini:obGlobal.obImagini.imagini});
})

// -------------------------------------- Produse ----------------------------------------

app.get("/produse", function(req, res){
    
    var conditieQuery="";
    if (req.query.tip){
        conditieQuery=` where tip_produs='${req.query.tip}'`
    }
    client.query("select * from unnest(enum_range(null::categ_aplicatii))", function(err, rezOptiuni){

        client.query(`select * from aplicatii ${conditieQuery}`, function(err, rez){
            if (err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else{
                res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
            }
        })
    });
})

app.get("/produs/:id", function(req, res){
    client.query(`select * from aplicatii where id=${req.params.id}`, function(err, rez){
        if (err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            res.render("pagini/produs", {prod: rez.rows[0]})
        }
    })
})


// -------------------------------------------------------------------------------------------------------

app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=path.join(__dirname,"temp/galerie_animata.css");
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});

app.get("/suma/:a/:b", function(req,res){
    res.write((parseInt(req.params.a)+parseInt(req.params.b))+"");
    res.end();
})

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/favicon/favicon.ico"));
    
});

app.get(new RegExp("^\/resurse\/[A-Za-z0-9_\/-]+\/$"), function(req, res){
    afisareEroare(res,403);
    
});

app.get("/*.ejs", function(req, res){
    afisareEroare(res,400);  
});



app.get("/*", function(req, res){
    // console.log(req.url)

    try {
        res.render("pagini"+req.url, function(eroare, rezRandare){
            console.log(rezRandare);
            console.log("Eroare:"+eroare)
                if (eroare){
                    if (eroare.message.startsWith("Failed to lookup view")){
                       afisareEroare(res,404);
                        console.log("Nu a gasit pagina: ", req.url)
                    }
                }
            })
    }
    catch (alteErori){
        if (alteErori.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
            console.log("Nu a gasit resursa: ", req.url)
        }
        else{
            afisareEroare(res);
            console.log("Eroare:"+alteErori)
        }
    }
})  

function initErori() {
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza,eroare.imagine)
    }
    obGlobal.obErori.eroare_default=path.join(obGlobal.obErori.cale_baza,obGlobal.obErori.eroare_default.imagine)
    //console.log(obGlobal.obErori);
}

initErori();
 
function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare=obGlobal.obErori.info_erori.find(
        function(elem){
            return elem.identificator==_identificator
        }
    )
    if (!eroare){
        eroare=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        }) 
        return;
    }
    else{
        if (eroare.status)
            res.status(eroare.identificator)

        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;
    }

}

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext]=imag.cale_imagine.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp" )

        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_imagine)
    }
    // console.log(obGlobal.obImagini)
}
initImagini();

function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]  
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss)
    // console.log("cale:",caleCss);

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    // console.log("Compilare SCSS",rez);
}

vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.listen(8080);
console.log("Serverul a pornit");