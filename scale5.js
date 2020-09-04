//Step 1: Get the file from the input element                
    document.getElementById("uploadFile").onchange = function(event) {
        var file = event.target.files[0];
        //Step 2: Read the file using file reader
        var fileReader = new FileReader();  
        fileReader.onload = function() {
        //Step 4:turn array buffer into typed array
        var typedarray = new Uint8Array(this.result);

            PDFJS.workerSrc = 'pdf.worker.js';

            PDFJS.getDocument(typedarray).then(function (pdf) {
                var pdfDocument = pdf;
                var pagesPromises = [];

                for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
                    // Required to prevent that i is always the total of pages
                        pagesPromises.push(getPageText(i+1, pdfDocument));
                }

                Promise.all(pagesPromises).then(function (pagesText) {

                    // Display text of all the pages in the //console
                    var all = "";
                    for(var i = 0;i < pagesText.length;i++){
                        all= all + pagesText[i];
                    }
                    
                    var finalString = "";

                    var year = true;
                    var cc = false;
                    var ct = false;
                    var grade = false;

                    var ccArray = [];
                    var ctArray = [];
                    var gradeArray = [];
                    var splitted = all.split("\n");
                    for(var j = 0; j < splitted.length; j++){
                        var item = splitted[j];
                         //matric
                            if(item.toLowerCase().includes("matric")){
                                finalString += item + "\n";
                            }

                            //name
                            if(item.toLowerCase().includes("name")){
                                finalString += item + "\n";
                            }

                            //programme
                            if(item.toLowerCase().includes("programme") && item.toLowerCase().includes(":")){
                                finalString += item + "\n";
                            }

                            //get year
                            if(year && item.toLowerCase().includes("20") && item.toLowerCase().includes("_")){
                                //finalString += item.str + "\n";
                                year = false;
                                cc = true;
                            }

                            //add course code
                            if(cc && (item.trim().length == 6) && !item.toLowerCase().includes("_")){
                                finalString += item + "\n";
                                ccArray.push(item);
                                cc = false;
                                ct = true;
                            }

                            //add course title
                            if(ct){
                                if(item.trim().length > 6){
                                    finalString += item + "\n";
                                    ctArray.push(item);
                                    ct = false;
                                    grade = true;
                                } else if(item === ""){
                                    finalString += "undefined\n";
                                    ctArray.push("undefined");
                                    ct = false;
                                    grade = true;
                                } else if (item.length == 1){
                                    finalString += "undefined\n";
                                    ctArray.push("undefined");
                                    ct = false;
                                    grade = true;
                                }
                            }

                            //add grade
                            if(grade && (item.length == 1)){
                                finalString += item + "\n\n";
                                gradeArray.push(item);
                                grade = false;
                                year = true;
                            }

                    }
                    //console.log(finalString);
                    //create items
                    autoAddItem(ccArray, ctArray, gradeArray);
                });

            }, function (reason) {
                // PDF loading error
                console.error(reason);
            });
        }
        //Step 3:Read the file as ArrayBuffer
        fileReader.readAsArrayBuffer(file);
    };

        /**
         * Retrieves the text of a specif page within a PDF Document obtained through pdf.js 
         * 
         * @param {Integer} pageNum Specifies the number of the page 
         * @param {PDFDocument} PDFDocumentInstance The PDF document obtained 
         **/
        function getPageText(pageNum, PDFDocumentInstance) {
            // Return a Promise that is solved once the text of the page is retrieven
            return new Promise(function (resolve, reject) {
                PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
                    // The main trick to obtain the text of the PDF page, use the getTextContent method
                    pdfPage.getTextContent().then(function (textContent) {
                        var textItems = textContent.items;
                        var finalString = "";
                        // Concatenate the string of the item to the final string
                        for (var i = 0; i < textItems.length; i++) {
                            var item = textItems[i];
                            finalString += item.str + "\n";
                        }
                        // Solve promise with the text retrieven from the page
                        resolve(finalString);
                       
                    });
                });
            });
        }

function autoAddItem(cc, ct, gr){
    //console.log("Start Adding");
    for(var ii = 0; ii < gr.length; ii++){
        var list = document.getElementById("dynamic-list").getElementsByTagName("li");
        var size = list.length
        var index = size+1;
        //console.log("Got count");
        var course_code = document.createTextNode(cc[ii]);
        var ul = document.getElementById("dynamic-list");
        var li = document.createElement("li");
        li.setAttribute('id', index);
        li.className = "form-inline added";
        //create blockquote
        var blockquote = document.createElement("blockquote");
        var input = document.createElement("input");
        input.setAttribute('id', index);
        input.setAttribute('type', "hidden");
        input.setAttribute('value', cc[ii]);
        //input.appendChild(course_code);
        //its content
        blockquote.appendChild(course_code);
        //console.log("Blockqoute ready");

        //create small
        var small = document.createElement("small");
        //its content
        var course_title = document.createTextNode(ct[ii]);
        small.appendChild(course_title);
        blockquote.appendChild(document.createElement("br"));
        blockquote.appendChild(small);
        //console.log("Small ready");

        //create grades
        var grades = document.createElement("select");
        grades.className = "form-control grades gradepoint";
        grades.setAttribute("id", "grade"+ii);
        //create grades options
        var options = ["A", "B", "C", "D", "E", "F"];
        //Create and append the options
        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.text = options[i];
            option.value = gr[ii];
            grades.appendChild(option);
        }

        //create credit unit
        var credit = document.createElement("select");
        credit.setAttribute("class", "credits");
        credit.className = "form-control grades creditpoint";
        credit.setAttribute("id", "credit"+ii);
        //create unit options
        var options = ["-1", "0", "1", "2", "3", "4", "5", "6"];
        //Create and append the options
        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i];
            option.text = options[i];
            credit.appendChild(option);
        }

        //lastly thr remove button
        var button = document.createElement("button");
        button.className = "btn btn-bg-warning btn-add";
        button.innerHTML = "Remove";
        button.type  = 'button';
        button.addEventListener('click', function() {
            removeItem(index);
        }, false);

        li.appendChild(input);
        li.appendChild(blockquote);
        li.appendChild(grades);
        li.appendChild(credit);
       // li.appendChild(button);
        ul.appendChild(li);

        setCount();
    }

    for(var k = 0; k < gr.length; k++){
        var grade = document.getElementById("grade"+k);
        grade.options[getGradeIndex(gr[k])].selected = true;
    }

    for(var l = 0; l < gr.length; l++){
        var grade = document.getElementById("credit"+l);
        grade.options[getCreditUnitIndex(cc[l])].selected = true;
        //grade.style.borderColor = "thick solid red";
        //console.log("Changing the credits");
    }
    
}

function getGradeIndex(grade){
    if(grade.toLowerCase() === "a"){
            return 0;
        } else if(grade.toLowerCase() === "b"){
            return 1;
        }   else if(grade.toLowerCase() === "c"){
            return 2;
        }   else if(grade.toLowerCase() === "d"){
            return 3;
        }   else if(grade.toLowerCase() === "e"){
            return 4;
        }   else {
            return 5;
        }
}

function addItem(){
    var item = document.getElementById("course_code");

    if(item.value == "" || item.value.length < 5){
        alert("Please insert a valid Course Code");
    } else {
        var ccc = [];
        var course_code = document.createTextNode(item.value.toUpperCase());
        var list = document.getElementById("dynamic-list").getElementsByTagName("li");
        var size = list.length
        var index = size+1;

        var ul = document.getElementById("dynamic-list");
        var li = document.createElement("li");
        li.setAttribute('id', index);
        li.className = "form-inline added";
        //create blockquote
        var blockquote = document.createElement("blockquote");
        var input = document.createElement("input");
        input.setAttribute('id', index);
        input.setAttribute('type', "hidden");
        input.setAttribute('value', item.value.toUpperCase());
        //input.appendChild(course_code);
        //its content
        blockquote.appendChild(course_code);

        //create small
        var small = document.createElement("small");
        //its content
        var course_title = document.createTextNode("empty");
        small.appendChild(course_title);
        blockquote.appendChild(document.createElement("br"));
        blockquote.appendChild(small);

        //create grades
        var grades = document.createElement("select");
        grades.className = "form-control grades gradepoint";
        //create grades options
        var options = ["A", "B", "C", "D", "E", "F"];
        //Create and append the options
        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i];
            option.text = options[i];
            grades.appendChild(option);
        }

        //create credit unit
        var credit = document.createElement("select");
        credit.setAttribute("class", "credits");
        credit.setAttribute("id", "credit"+index);
        credit.className = "form-control grades creditpoint";
        //create unit options
        var options = ["-1", "0", "1", "2", "3", "4", "5", "6"];
        //Create and append the options
        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i];
            option.text = options[i];
            credit.appendChild(option);
        }

        //lastly thr remove button
        var button = document.createElement("button");
        button.className = "btn btn-bg-warning btn-add";
        button.innerHTML = "Remove";
        button.type  = 'button';
        button.addEventListener('click', function() {
            removeItem(index);
        }, false);

        li.appendChild(input);
        li.appendChild(blockquote);
        li.appendChild(grades);
        li.appendChild(credit);
        li.appendChild(button);
        ul.appendChild(li);

        setCount();
        var u = document.getElementById("credit"+index);
        u.options[getCreditUnitIndex(item.value.toUpperCase())].selected = true;
    }
}

function removeItem(index){
    //var list = document.getElementById("dynamic-list").getElementsByTagName("li");
    //var size = liList.length
    var list = document.getElementById("dynamic-list");
    var item = document.getElementById(index);
    list.removeChild(item);
    setCount();
}

function setCount(){
    var list = document.getElementById("dynamic-list").getElementsByTagName("li");
    var size = list.length;
    var header = document.getElementById("count");
    header.innerHTML = "Queued Courses("+size+")";
}

function calculateGP(){
    var list = document.getElementById("dynamic-list").getElementsByTagName("li");
    var size = list.length;
    if(size <= 0){
        alert("Please insert at least a course for calculation");
        return false;
    }
    //get the course codes
    var codes = document.forms["myForm"].getElementsByTagName("input");
    var title = document.forms["myForm"].getElementsByTagName("small");
    var grades = document.forms["myForm"].getElementsByClassName("gradepoint");
    var credits = document.forms["myForm"].getElementsByClassName("creditpoint");

    var creditsArray = [];
    var gradeArray = [];
    var cc ="";
    for(var i = 0; i < codes.length; i++){
        creditsArray.push(credits[i].options[credits[i].selectedIndex].text);
        gradeArray.push(grades[i].options[grades[i].selectedIndex].text);
    }

    var data = generateCGPA(creditsArray, gradeArray);
    cc =  "<h4><b>SUMMARY</b></h4><br />Total Credit Carried: "+data[0]
        + "\n<br />Total Credit Earned: "+data[1]
        + "\n<br />Total Grade Point Earned: "+data[2]
        + "\n<br />CGPA: <b>"+data[3].toFixed(2)+"</b>"
		+ "\n<br /><b>GRADE: </b>"+data[4]
		+ "\n<br /><b>TechFlex e_Learn Advise: </b>"+data[5];

    //alert(cc);
    // Get the modal
    var modal = document.getElementById('myModal');
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    var content = document.getElementById("summary");
    content.innerHTML = cc;
    modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    return false;
}

function generateCGPA(credits, grades){
    var tgpe = 0;
    var tcc = 0;
    var tce = 0;
	var gpaclass = "";
	var advise = "";

    if(grades.length > 0){
        for(var i = 0; i < grades.length; i++){
            var unit = credits[i];
            var grade = parseFloat(purifyGrade(grades[i]));
            tcc = parseFloat(tcc) + parseFloat(unit);
            tgpe = parseFloat(tgpe) + parseFloat((parseFloat(unit)*parseFloat(grade)));
            tce = parseFloat(tce)+ parseFloat(refineCreditEarned(unit, grade));
        }
    }
    var cgpa = tgpe / tcc;
    
    {
	if(cgpa >= 4.5){
		gpaclass = "First Class Honours";
		advise = " - SKY IS JUST THE BEGINING";
	}else if(cgpa >= 3.5){
		gpaclass = "Second Class Honours (Upper Division)";
		advise = " - SKY IS JUST THE BEGING: Don't Relent";
	}else if(cgpa >= 2.5){
		gpaclass = "Second Class Honours (Lower Division)";
		advise = " - GOOD ONE: But You Can Still Do Better";
	}else if(cgpa >= 2.0){
		gpaclass = "Third Class Honours";
		advise = " - YOU CAN STILL DO IT  :Put More Effort You can Still Do Better";
	}else if(cgpa >= 1.5){
		gpaclass = "PASS";
		advise = " - YOU ARE RELENTING  :Put More Effort You can Still Do Better";
	}else{
		gpaclass = "FAIL";
		advise = "Put More Effort   Or  ADVISE TO WITHDRAW!!!! ";
	}
	}
	
    var data = [];
    data.push(tcc);
    data.push(tce);
    data.push(tgpe);
    data.push(cgpa);
	data.push(gpaclass);
	data.push(advise);

    return data;
}

function purifyGrade(grade){
    if(grade.toLowerCase() === "a"){
            return 5;
        } else if(grade.toLowerCase() === "b"){
            return 4;
        }   else if(grade.toLowerCase() === "c"){
            return 3;
        }   else if(grade.toLowerCase() === "d"){
            return 2;
        }   else if(grade.toLowerCase() === "e"){
            return 1;
        }   else {
            return 0;
        }

}

function refineCreditEarned(unit, grade){
    if(grade == 0.0){
        return grade;
     } 
    return unit;
}

function getCreditUnitIndex(cc){
    var index = -1;
    var credit = -1;
    var here = 0;
    var courses = ["GST101","GST107","GST105","GST102","GST201","GST203","GST202","GST302","GST301","GST707","GST807","DLS001","PHY001","MTH001","CHM001","BIO001","ENL001","ENG001","HCM147","HCM145","HCM141","HCM135","HCM133","HCM131","HCM144","HCM146","HCM142","HCM136","HCM134","HCM243","ANP201","SMS 207","HCM232","HCM239","HCM237","HCM235","HCM231","ARD201","ARD203","ARD251","SLM201","AGR205","FRM211","SOS203","SOS201","AGR203","AGR201","AGE202","AEM251","AEM246","AEM203","AEM201","HCM244","HCM241","AFS202","AEM212","HCM210","HCM238","HCM236","HCM234","ARD202","ANP204","ANP202","AGR215","AGR202","AFS220","FST202","AEM202","ANP309","ANP303","AGR309","HCM349","HCM347","HCM305","CRP305","CRP308","CRP303","AGR305","AFM305","SLM310","SLM305","ACP301","HCM345","HCM343","HCM339","HCM333","HCM313","CRP313","SOS301","SLM306","CRP311","ANP313","AGR307","AEM311","AEM303","AEM301","AEA303","ACP305","ACP303","ANP301","CRP309","CRP310","AEM310","AGR314","ARD312","ANP312","ANP306","ANP304","AGR302","CRP304","HCM348","AEA310","AEA308","AEA306","ARD304","ARD302","AFM318","AFM314","AFM310","HCM342","HCM340","HCM310","HCM304","HCM303","ARD301","SLM303","CRP306","ARD308","ANP310","ANP307","ANP302","AGM314","AFM321","AFM317","AEM304","AEM302","AEC308","AEC306","AEA304","AEA302","SLM407","CRP407","ARD403","AEM403","AEC401","SLM403","SLM401","CRP405","CRP403","ANP403","ANP401","CRP401","CSP401","HCM439","HCM437","HCM435","HCM431","AGB404","AEM458","AEM450","AEA403","AEM451","CPS401","HCM433","HCM444","HCM442","AGR401","AGM403","AFS401","AGR403","ANP407","SLM405","AGM401","ARD401","HCM436","HCM432","HCM412","AEM400","HCM450","HCM432","HCM438","HCM436","AGE421","AEM411","AEM405","AEC403","CRP508","ARD509","AGR515","AGR501","SLM504","CRP503","AFM505","AEM511","AEM509","AEM507","AEM505","AEM504","AEM503","AEM501","AEA507","AEA506","AEA503","AEA501","AEM599","CPT514","ARD513","AFM510","AEM512","AEM510","AEM508","AEM506","AEM502","AEM773","AEM757","AEM 711","AEM751","AEM723","AEM741","AEM772","AEM753","AEM736","AEM724","AEM722","AEM712","AEM711","AEM701","COP721","AEM734","AEM738","AEM732","AEM719","AEM716","AEM715","AEM713","INR113","LIN111","FRE141","FRE131","FRE121","FRE111","CTH101","CTH113","CTH131","CRS111","CTH141","CTH173","CRS151","ENG141","ISL121","ISL113","ISL111","ISL101","ENG211","FRE101","LIN111","ENG181","ENG161","ENG113","ENG111","ENG121","ARA183","ARA181","FRE162","FRE132","FRE112","FRE152","FRE122","ISL132","CTH152","CTH192","CTH122","CTH142","CTH102","INR142","ARA182","ISL172","ISL142","ISL136","ISL102","FRE102","LIN112","ENG151","ENG122","ENG114","ENG162","ENG215","ENG251","FRE271","FRE221","FRE211","FRE231","CTH261","CTH217","CTH215","CTH211","CTH271","CTH213","CTH233","ARA283","ISL271","ISL245","ISL241","ISL231","ISL213","CSS211","ENG241","ENG 223","ENG221","ARA281","ENG216","FRE282","FRE212","FRE222","CTH210","CHT218","CTH218","CTH202","CTH222","CTH216","CTH214","CTH272","CTH212","CTH231","ISL272","ISL222","ISL214","ISL212","ENG226","ENG222","ENG281","ENG224","ENG212","ARA284","ARA282","ENG313","ENG381","ENG321","FRE321","FRE301","FRE381","FRE331","CTH313","CTH323","CTH321","CTH311","ARA383","ARA381","ISL373","ISL361","ISL355","ISL339","ISL343","ISL313","ENG312","ENG311","ENG353","ENG351","ENG321","ENG355","ENG362","ENG372","FRE372","FRE322","FRE382","FRE392","ENG316","CTH316","CTH314","CTH302","CTH352","CTH324","ISL330","ISL304","ISL302","ISL374","ISL372","ISL332","ISL312","ARA382","INR332","ENG352","ENG341","ENG314","ENG 316","ENG331","ENG426","ENG423","ENG417","ENG415","ENG421","FRE441","FRE411","FRE423","FRE471","FRE421","FRE481","CTH491","CTH471","CTH413","CTH441","CTH423","ARA483","ARA481","ISL471","ISL451","ISL439","ISL437","ISL435","ISL415","ISL431","ENG414","ENG491","ENG453","ENG421","ENG411","FRE424\/INR442","FRE472","FRE422","FRE482","CTH474","CTH472","CTH412","CTH432","CTH422","ISL492","ISL474","ISL472","ISL438","ISL436","ISL432","ISL412","ISL402","ENG454","ENG434","ENG432","ENG418","ENG416","CTH771","CTH723","CTH715","CTH721","CTH713","CTH711","CTH772","CTH792","CTH732","CTH724","CTH702","CTH714","CTH742","CTH704","CTH722","CTH825","ENG815","CTH852","CTH803","CTH841","CTH821","CTH826","CTH814","CTH812","CTH817","CTH815","CTH813","ENG814","CRS805","CTH852","CTH828","CTH842","CTH832","CTH845","CTH807","CTH820","CTH818","CTH823","CTH801","CTH849","CTH 820","CTH878","CTH847","CTH825","CTH819","CTH805","PHY 302","BED113","BED111","PED121","PHY113","ECE110","VTE115","SED123","PED144","PED122","ECE123","ECE113","ECE121","EDU111","EDU114","EDU112","BED114","BED112","PED120","PED150","PED110","PED112","SED124","SED121","SED122","PED130","ECE120","ECE112","PED235","PED261","PED233","EDU220","SED223","SED211","SED221","SED225","PED236","ECE231","ECE225","ECE227","ECE221","ECE223","EDU233","EDU222","PED230","EDU292","EDU290","PED271","EDU282","BED212","BED214","SED226","SED224","SED222","SED214","EDU254","EDU256","EDU240","EDU216","EDU258","PED232","ECE232","ECE222","ECE230","EDU252","EDU321","EDU250","EDU212","EDU231","EDU214","EDU280","BED313","PED313","EDU320","SED315","SED323","SED329","SED321","SED327","ECE313","ECE311","EDU421","EDU335","EDU323","PHY302","BED314","PED320","PED312","ECE212","BED312","SED313","SED312","SED322","SED314","PED351","PED322","PED237","PED234","EDU302","SED305","SED324","EDU300","SED305","EDU336","EDU314","EDU332","PHY451","BED413","PED423","SED421","SED411","PED431","PED433","PED410","PED421","ECE413","ECE421","SED413","EDU423","EDU435","PHY452","BED412","PED422","PED412","EDU400","ECE420","ECE422","VTE414","BED416","SED470","PED430","PED420","SED422","ECE412","ECE410","SED412","EDU420","EDU426","EDU412","Ed 726","EDU762","EDU731","EDU723","EDU726","EDU724","EDU712","EDU716","EDU721","EDU752","EDU766","EDU764","EDU758","EDU756","EDU740","EDU754","EDU750","EDU780","EDU782","EDU730","EDU768","EDU760","EDU722","EDU728","EDU720","EDU713","EDU714","EDU732","EDU711","EDU718","EDU733","EDU735","EDU784","EGC813","EGC809","EGC805","EGC803","EGC801","EDA831","EDA821","EDA825","SED835","SED831","SED811","EDT821","EDT831","EDU823","EDU821","EDU808","EGC812","EGC810","EGC806","EGC804","EGC802","EDA855","EDA851","EDA823","EDA813","EDA856","EDA854","EDA852","EDA844","EDA834","EDA833","EDA832","EDA822","EDA812","EDA811","SED800","SED834","SED832","EDU820","EDT811","EDT823","EDT833","EDA842","EDT812","EDT832","EDT834","EDT830","EDU822","EDU815","EGC817","EGC815","EGC811","EDU931","EDP917","EDP916","EDP915","EDP914","EDP913","EDP911","EDA919","EDA918","EDA917","EDA916","EDA915","EDA913","EDA911","EDT933","EDT931","EDU921","NSC111","NSC108","NSC106","NSC104","NSC102","NSC 206","PED221","PHS217","PHS203","PHS201","NSS241","NSS213","NSS211","NSS203","NSC209","NSC207","NSC205","NSC203","EHS216","EHS212","EHS204","PHS202","PHS210","PHS204","NSS222","NSS214","NSS201","NSC212","NSC210","NSC208","NSC204","NSC202","NSC201","NSC312","NSC306","NSC314","NSC316","NSC305","NSC309","NSC301","NSC307","NSC303","NSC311","EHS317","EHS319","EHS315","PHS311","PHS303","PHS301","NSS327","NSS325","NSS323","NSS321","NSS217","NSS311","NSS305","NSS303","NSS301","EHS322","EHS316","EHS312","EHS308","EHS306","EHS304","PHS326","PHS322","PHS318","PHS312","PHS308","PHS302","NSC206","PHS305","NSS312","NSS324","NSS320","NSS322","NSS316","NSS306","NSS302","NSC405","NSC402","NSC401","NSC411","NSC407","NSC403","EHS411","EHS407","EHS405","EHS403","PHS421","EHS409","PHS403","PHS401","NSS413","NSS411","NSS409","NSS407","NSS401","NSC416","NSC412","EHS402","PHS430","PHS426","PHS424","PHS422","PHS404","PHS402","NSS412","NSS410","NSS403","NSS402","NSC509","NSC511","EHS507","EHS505","EHS501","PHS599","PHS511","PHS509","PHS507","PHS505","NSS509","NSS513","NSS511","NSS508","NSS504","NSC512","EHS506","EHS502","PHS512","PHS524","PHS520","NSS507","HEM745","HEM731","HEM717","HEM710","HEM707","HEM705","HEM704","HEM701","HEM712","HEM709","HEM706","HEM700","HEM742","HEM726","HEM703","HEM702","LED023","LED021","JIL111","JIL100","JIL112","LED029","LED027","LED025","CLL203","LAW103","CLL233","CLL231","JIL211","PUL243","PUL241","CLL232","JIL212","PUL244","PUL242","CLL234","PUL337","CLL307","PUL321","LAW331","PPL343","PUL341","PPL323","PPL344","LAW332","PPL324","PUL322","PUL342","JIL447","PUL446","PUL445","PUL443","JIL441","PPL435","PUL433","CLL431","PPL421","PPL423","PUL411","JIL448","JIL412","CLL432","PUL444","PPL436","PUL434","PPL424","PPL422","PUL412","JIL515","CLL533","JIL531","PPL521","PPL517","JIL511","LAW500","JIL514","CLL534","JIL532","PPL522","PPL518","JIL513","JIL512","JIL516","PUL 743","LED755","LED754","LED753","LED752","LED751","LED750","LED700","PUL743","LED707","LED705","LED609","LED607","LED605","LED701","LED703","LED757","LED759","LED712","LED711","LED656","LED602","LED654","LED652","LED650","LAW600","PUL844","ENS205","CRD101","ENT101","ACC101","COP113","COP111","BUS105","SMS101","MKT104","PAD122","CRD122","CRD120","ENT102","CRD124","ACC102","COP116","BFN104","COP114","SMS102","BUS106","MKT108","BFN203","ENT203","PAD251","ENT209","ACC201","MKT201","SMS211","COP215","COP211","ENT225","MKT205","ENT201","BUS205","ACC203","BUS207","SMS201","MGS207","BFN209","CRD206","CRD204","CRD208","MKT210","ENT208","ENT204","ENT202","PAD202","MKT206","ENT216","ENT210","ACC210","SMS210","COP216","COP214","ENT224","ACC206","ACC204","SMS202","CIT202","PAD371","PAD301","CRD307","CRD303","MKT301","ENT323","BFN305","MKT303","MKT305","ENT305","ENT303","ENT301","MKT309","ENT307","BUS325","BUS317","BFN303","ENT321","ACC313","ACC311","ACC306","SMS303","COP317","COP315","COP311","ENT331","ENT313","PAD305","ENT329","PAD308","PAD306","PAD330","PAD312","PAD302","PAD326","ENT312","CRD330","BFN310","PAD354","CRD332","PAD328","CRD326","CRD324","CRD322","CRD320","BFN308","BFN306","BFN302","MKT308","MKT302","ENT310","ENT308","ENT306","ENT304","BUS330","BUS322","ENT302","MKT306","FMS330","COP318","COP312","BFN304","ACC320","ACC318","ACC316","ACC312","CRD334","ENT332","ENT322","CRD305","ENT352","ENT324","ENT330","FMS304","ENT328","PAD409","PAD405","ENT409","ACC407","ENT403","ENT415","ENT411","ENT413","ENT405","CRD409","CRD407","ACC405","CRD403","BUS403","MKT411","BFN407","BFN403","BFN401","MKT403","MKT401","BFN409","BFN421","ENT401","BUS419","BUS429","BFN411","COP415","BUS401","ACC419","COP413","COP411","MGS403","BFN405","BUS451","BUS427","ENT421","ENT419","ENT431","ENT417","ENT407","PAD412","ENT412","ENT410","ENT408","ENT428","PAD408","CRD422","MKT402","BUS424","ENT414","BUS450","PAD410","ACC450","COP418","COP450","ACC411","COP416","COP414","BUS428","BUS406","ACC426","ACC418","CRD430","ENT432","COP412","ENT450","ENT430","ENT420","ENT402","ENT424","BUS701","ACC757","MGS735","BUS729","MGS761","PAD784","BFN779","PAD771","PAD747","FMS731","BUS727","PAD707","BFN737","BFN721","MGS713","FMS719","BFN715","BUS704","BFN790","PAD790","BUS726","BUS722","BUS720","BUS790","PAD756","PAD742","PAD724","PAD712","PAD710","BFN748","BFN740","BFN732","MKT730","BFN728","BUS718","BUS717","MBA824","PAD823","PAD803","BUS849","BUS825","BUS815","BUS831","BUS847","BUS839","MBF805","MBA817","MBA815","MPA807","PSM831","PSM829","PSM825","PSM823","PSM817","MPA823","PSM815","PSM813","PSM809","PSM805","PSM807","PAD858","MPA871","MKT826","MBA831","FMS825","MBA801","MPA858","MPA812","PAD854","PAD812","PAD868","BFN852","PAD810","BUS898","BUS818","BUS810","BUS804","BUS800","MBA816","MBA820","MBA806","MBA814","CLL804","ACC812","PSM890","MBA840","MPA870","MPA868","MPA810","PAD856","PSM804","PSM802","PSM800","MPA809","MPA854","MBA 888","MBA851","PAD841","PAD871","PAD853","PAD843","PAD831","PAD870","PAD813","PAD807","BUS835","BUS805","BUS801","ENT893","BUS887","BUS811","BUS809","MBF841","MBA813","MBF833","MBA837","MBA823","MBA821","MKT825","MPA856","MPA853","MPA843","MPA841","PAD855","MPA855","MBA853","ICT845","MBA859","MBF839","MBA881","ENT883","MBF845","MBF843","MBA835","MBA829","MBA827","MBA833","MKT823","MKT837","MKT859","MKT833","MKT827","MKT829","MBA889","PAD890","BUS890","MBA888","MPA890","MBA890","ENT896","MTH121","MTH105","MTH112","MTH133","CIT143","CIT141","PHY191","PHY103","PHY101","MTH103","MTH101","CIT101","CHM191","BIO191","CHM103","CHM101","BIO101","MTH142","ESM106","MTH106","PHY124","PHY192","ESM104","ESM102","CHM102","CIT104","CIT132","PHY132","BIO192","BIO102","PHY192","PHY102","MTH102","CIT102","ESM112","CHM192","STT102","CHM102","MTH104","ESM299","MTH131","STT205","PHY201","FMT215","ESM291","ESM231","ESM221","ESM211","DAM207","DAM205","PHY291","PHY261","PHY207","PHY203","CIT237","CIT211","CHM205","CHM292","CHM291","CHM204","CHM203","CHM202","CHM201","STT211","MTH281","MTH241","MTH213","MTH211","CIT215","BIO217","BIO215","BIO213","BIO211","BIO209","BIO207","BIO205","BIO203","BIO201","CIT204","STT206","FMT212","FMT206","FMT204","ESM292","ESM238","ESM236","ESM234","ESM222","ESM212","ESM206","ESM204","DAM212","CIT236","PHY208","CIT292","CIT246","CIT212","CIT208","CIT213","BIO220","PHY202","PHY206","PHY204","MTH282","MTH251","MTH210","MTH232","MTH212","BIO218","BIO216","BIO214","BIO212","BIO210","BIO208","BIO206","BIO204","CHM392","PHY301","CHM313","FMT313","FMT309","STT311","ESM399","ESM345","ESM343","ESM341","ESM317","ESM311","ESM303","ESM301","DAM363","DAM361","BIO313","BIO311","BIO309","BIO307","BIO305","BIO303","BIO301","DAM301","CIT305","CIT303","PHY391","PHY361","PHY313","PHY311","PHY309","PHY307","PHY303","CIT381","CIT383","CIT371","CIT353","CIT351","CIT341","CIT333","CIT311","CIT309","MTH309","MTH307","MTH303","MTH381","CHM391","CHM315","CHM311","CHM309","CHM307","CHM305","CHM303","CHM301","MTH341","MTH311","MTH304","MTH301","CIT361","CIT345","FMT312","ESM392","ESM342","ESM328","ESM324","ESM322","ESM308","ESM304","DAM382","DAM344","BIO320","BIO318","BIO316","BIO314","BIO312","BIO310","BIO308","BIO306","BIO304","BIO302","PHY399","PHY362","PHY314","DAM364","PHY312","PHY310","PHY308","PHY306","CIT392","CIT344","CIT342","CIT322","CIT389","MTH315","MTH382","MTH312","MTH308","MTH305","MTH302","CHM318","CHM316","CHM314","CHM312","CHM306","CHM304","CHM302","PHY408","PHY403","CHM424","CHM405","CHM411","FMT409","ESM431","ESM423","ESM421","ESM411","ESM405","ESM403","ESM401","ESM407","DAM463","DAM401","DAM461","CIT415","BIO411","BIO407","BIO405","BIO403","BIO401","BIO400","PHY461","PHY457","PHY455","PHY407","PHY405","CIT467","CIT465","CIT463","CIT461","CIT445","CIT427","CIT425","CIT411","CIT403","MTH417","MTH423","MTH421","MTH411","MTH401","CHM423","CHM421","CHM417","CHM415","CHM413","CHM409","CHM407","CHM401","BIO409","PHY492","CIT422","CHM402","CHM426","MTH416","CIT462","CHM400","FMT499","ESM444","ESM428","ESM426","ESM424","ESM422","DAM499","DAM462","BIO416","BIO414","BIO412","BIO410","BIO408","BIO406","BIO404","BIO402","BIO415","BIO413","PHY499","PHY456","PHY406","PHY404","PHY402","PHY401","CIT478","CIT474","CIT499","CIT484","CIT432","CIT412","MTH499","MTH422","MTH412","MTH402","CHM422","CHM416","CHM414","CHM408","CHM406","CIT705","CIT726","CIT735","CIT771","CIT721","CIT701","CIT759","CIT755","CIT753","CIT723","CIT711","CIT703","CIT732","CIT736","CIT754","CIT708","CIT799","CIT758","CIT756","CIT752","CIT742","CIT734","CIT722","CIT891","CIT853","CIT851","CIT843","CIT841","CIT831","CIT811","CIT899","CIT854","CIT852","CIT844","CIT834","CIT832","CIT802","5205_ESM292","JLS111","TSM147","TSM145","TSM143","TSM141","POL123","POL121","PCR115","MAC121","MAC117","INR121","INR111","MAC115","MAC113","MAC111","PCR113","PCR111","POL111","ENT121","ECO153","ECO121","CSS134","CSS133","CSS131","CSS121","CSS111","MAC132","TSM146","TSM144","TSM142","ECO154","PCR112","POL124","INR162","INR142","INR132","INR122","INR112","MAC142","MAC134","MAC118","MAC116","PCR114","ECO146","ECO122","CSS152","POL126","CSS136","CSS132","CSS112","ECO292","PCR261","INR261","ENG223","TSM243","TSM241","POL231","POL221","POL215","POL223","POL211","POL215","POL231","INR251","INR231","INR211","MAC225","MAC223","MAC221","MAC213","MAC211","POL223","PCR211","ECO247","ECO255","ECO253","ECO231","CSS245","PCR271","CSS211","CSS243","CSS241","TSM244","TSM252","POL228","POL224","PCR276","POL228","POL226","POL216","POL212","INR262","POL214","POL212","INR242","INR232","INR222","INR212","MAC246","MAC242","MAC232","MAC214","INR221","MAC224","ECO256","ECO254","ECO232","PCR276","MAC212","PCR274","PCR272","CSS246","CSS242","CSS244","CSS212","INR309","CSS331","MAC343","ECO323","CSS 331","ECO332","MAC311","MAC345","MAC323","MAC315","POL322","POL315","TSM349","TSM347","PCR311","PCR373","PCR371","PCR331","POL337","POL324","POL317","POL316","POL312","INR341","INR391","POL311","INR381","INR371","INR361","INR351","INR331","INR321","MAC341","MAC333","MAC331","MAC313","ECO311","ECO329","ECO347","ECO355","ECO343","ECO341","PCR375","CSS343","CSS381","CSS361","CSS351","CSS371","CSS341","MAC324","INR302","ECO344","INR311","PCR312","TSM350","TSM310","TSM348","TSM342","TSM305","PCR352","PCR374","PCR372","PAD341","POL318","POL301","INR312","INR372","INR386","INR382","INR342","INR352","INR332","INR322","MAC312","MAC314","MAC316","MAC318","MAC334","MAC332","MAC322","ECO346","ECO314","ECO348","ECO356","ECO324","ECO342","POL326","PCR362","CSS342","CSS356","CSS354","CSS352","INR411","CSS461","CSS411","CSS455","INR481","INR461","POL452","POL441","POL401","TSM447","TSM441","TSM403","POL421","PCR421","PCR419","PCR423","PCR411","INR491","PCR415","PCR417","INR451","INR441","INR431","INR421","MAC427","MAC441","MAC425","MAC423","MAC413","MAC421","MAC411","ECO415","ECO459","ECO449","ECO443","ECO441","ECO447","ECO427","ECO445","ECO453","ECO431","CSS443","ENG453","CSS431","CSS491","CSS441","INR482","INR492","INR452","CSS462","ECO440","HCM434","TSM450","HCM434","POL432","POL411","POL401","POL444","PCR424","PCR426","TSM444","TSM442","PCR422","MAC412","POL424","POL431","INR422","INR432","INR412","MAC418","MAC444","MAC442","MAC428","MAC424","MAC416","MAC414","ECO444","ECO452","ECO448","ECO446","ECO454","ECO442","CSS442","CSS432","PCR412","CSS433","CSS452","CSS751","ECO719","ECO718","PCR771","PCR715","PCR713","PCR711","JLS721","JLS714","JLS713","JLS711","CSS745","CSS791","CSS757","CSS755","CSS753","CSS743","PCR772","PCR718","PCR716","PCR714","PCR712","JLS716","JLS732","JLS742","JLS726","JLS724","JLS722","JLS712","CSS747","CSS772","CSS774","CSS746","CSS744","CSS742","CSS732","JLS811","PCR873","PCR833","PCR819","PCR851","PCR815","PCR813","PCR811","JLS845","JLS815","JLS813","JLS825","JLS823","PCR810","PCR822","PCR831","PCR817","PCR812","PCR872","JLS816","JLS826","JLS822","JLS814","JLS812","ECO828","ECO802","JLS843","JLS842","CTH043","ACC305","ACC307","ACC330","ACC415","BUS427","BUS428","ENT417","ENT432","SMS101","SMS102","SMS105","SMS106","SMS201","SMS202","SMS203","SMS204","SMS205","SMS206","SMS207","SMS208","SMS209","SMS210","SMS211","SMS304","SMS305","BFN402","COP111","COP113","COP116","COP211","COP212","COP215","COP216","COP317","COP311","COP312","COP318","COP330","COP411","COP412","COP413","COP414","COP416","COP415","ENT215","ENT313","ENT325","ENT326","ENT419","ENT424","LAW100","MGS304","COP212","COP307","ENT325","ENT352","MGS304","CSS204","PAD124","PAD126","PAD337","PAD401","PAD403","PAD415","BUS331","ENT325","ENT421","HCM433","LAW111","LAW112","LAW212","LAW212","LAW231","LAW232","LAW233","LAW234","LAW241","LAW242","LAW243","LAW244","LAW321","LAW322","LAW323","LAW324","LAW331","LAW332","LAW341","LAW342","LAW343","LAW344","LAW411","LAW412","LAW421","LAW422","LAW423","LAW424","LAW431","LAW432","LAW433","LAW434","LAW435","LAW436","LAW441","LAW442","LAW443","LAW444","LAW445","LAW446","LAW511","LAW512","LAW513","LAW514","LAW515","LAW516","LAW517","LAW518","LAW521","LAW522","LAW531","LAW532","LAW533","LAW534","BUS802","BUS805","BUS808","BUS825","BUS893","MBA825","MBA831","PAD844","PAD852","BHM805","MBA804","MBA812","MBA813","MBA824","MBA843","MBA853","MBA859","MBA883","MBA896","MBF841","MBF845","MPA844","MPA858","PAD855","PAD858","MGS715","MGS719","MGS721","MGS731","MGS737","MGS757","MGS779","MGS714","MGS718","MGS728","MGS730","MGS732","MGS740","MGS748","PAD844","PAD852","BUS818","BUS893","BUS805","BUS808","MGS729","PAD735","MGS757","MGS720","MGS722","MGS726","MGS707","MGS727","MGS734","MGS747","MGS771","MGS783","MGS710","MGS712","MGS724","MGS742","MGS756","MBA833"];
    var credits = ["2","2","2","2","2","1","2","2","2","2","2","1","4","4","4","4","4","4","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","2","2","3","2","3","2","2","2","2","3","2","2","2","2","3","2","2","2","2","2","2","2","2","3","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","2","3","2","3","2","2","2","2","2","2","2","3","2","2","2","3","2","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","3","","3","3","3","2","2","2","2","2","2","2","2","3","2","2","2","2","3","3","3","2","3","3","2","2","2","3","2","2","3","2","2","2","2","2","2","2","12","6","2","2","2","3","3","3","3","3","3","1","3","2","3","3","3","3","3","3","3","3","3","3","3","3","3","4","2","3","3","2","2","2","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","6","2","2","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","3","3","2","2","2","2","2","2","2","2","2","3","2","","","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","2","1","2","2","2","3","3","2","2","2","2","2","3","3","2","2","2","2","2","3","2","2","2","2","3","2","2","3","3","2","3","2","3","2","0","2","3","3","3","3","3","3","3","2","2","2","2","3","2","3","2","3","2","2","3","3","3","3","3","3","3","3","2","2","3","3","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","2","2","3","3","2","3","3","3","2","3","2","2","2","2","2","2","","2","2","2","2","3","2","2","2","2","2","2","","3","3","3","3","6","2","2","2","4","2","2","2","2","4","2","3","2","2","2","3","2","3","3","3","","2","2","2","2","2","2","2","4","2","2","2","2","2","2","","2","3","3","3","","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","2","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","3","","2","2","2","3","3","2","2","3","2","2","2","2","2","2","2","2","3","3","2","2","2","3","2","2","2","2","2","2","2","2","2","2","2","4","2","2","","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","","2","2","2","2","2","2","2","2","2","4","3","2","2","2","2","2","2","2","3","3","3","2","2","3","3","3","2","1","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","2","2","3","6","3","3","2","2","2","2","2","2","2","3","2","2","2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","3","3","3","4","4","","2","3","3","3","2","3","5","3","2","3","2","4","2","3","2","3","3","3","3","3","3","2","3","2","2","3","4","3","3","3","3","3","4","2","3","2","2","2","3","3","3","2","3","3","3","4","3","2","3","2","2","3","2","2","2","3","2","2","3","3","3","2","3","3","2","2","3","4","3","3","3","2","3","4","4","4","3","2","3","2","3","3","3","3","2","2","3","4","3","2","3","4","4","3","6","3","3","2","2","3","4","3","4","4","4","3","3","3","2","1","5","","2","2","3","5","3","3","3","3","3","2","4","6","3","","3","3","2","2","2","2","3","2","3","3","3","3","6","2","2","3","3","3","3","2","3","2","3","3","3","3","2","4","4","4","4","4","4","4","4","4","4","3","3","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","5","4","4","4","4","4","4","","4","4","4","4","4","4","4","2","4","3","3","3","3","3","3","4","4","4","4","3","6","3","3","3","2","3","2","3","2","2","2","2","2","3","3","3","3","3","2","3","3","2","3","2","3","2","2","2","2","3","2","2","3","3","2","2","2","2","2","3","3","3","3","2","3","3","2","2","3","2","2","2","3","2","2","2","2","2","2","2","2","3","3","3","3","3","3","2","3","2","2","3","3","2","2","2","2","2","2","3","3","3","2","3","3","3","2","2","2","2","2","2","3","2","3","3","3","3","3","3","2","3","2","2","2","3","3","3","3","2","3","3","3","3","2","2","2","2","2","3","3","2","3","3","2","2","2","2","3","3","3","2","2","2","2","3","2","2","3","2","3","3","2","3","3","2","2","2","2","2","2","3","3","3","2","3","3","3","3","3","3","2","2","3","3","3","2","3","3","2","2","2","2","2","3","2","2","2","2","2","2","3","2","2","3","3","3","2","2","2","6","2","6","2","6","3","2","2","3","3","3","3","2","2","2","6","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","4","4","2","2","2","4","2","2","2","2","2","2","2","2","2","2","2","2","3","2","3","","2","2","2","2","2","3","3","3","3","2","2","3","2","3","2","2","2","3","2","3","2","3","3","3","3","3","2","3","2","2","3","3","3","2","2","2","2","2","3","3","3","3","3","3","6","3","2","3","3","2","2","2","3","2","2","3","3","2","2","2","2","2","2","3","3","2","2","2","2","2","2","2","3","3","3","3","3","3","3","2","2","2","2","2","2","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","6","6","3","6","6","3","2","2","2","2","2","2","1","2","2","3","3","2","1","1","2","2","2","2","2","2","3","2","2","2","2","2","2","2","2","2","1","3","3","2","2","1","2","2","2","3","2","3","3","3","2","2","2","2","2","2","1","2","2","2","3","3","2","2","2","2","2","2","2","3","3","3","3","3","3","3","1","2","2","3","2","3","2","2","2","3","2","2","2","2","3","2","2","2","2","2","3","2","3","3","2","2","3","2","2","2","2","2","2","3","3","3","3","3","2","2","2","2","2","2","2","2","2","3","2","3","3","3","6","2","2","2","2","2","2","2","2","2","2","2","1","2","2","2","2","3","3","3","2","2","3","2","3","2","2","2","2","3","2","2","3","2","3","3","3","3","3","3","2","2","2","2","3","3","3","3","3","3","3","3","2","3","3","2","3","2","2","2","2","3","3","2","3","3","1","2","3","2","2","2","2","1","3","2","2","2","3","2","2","2","2","3","3","3","6","3","3","3","3","3","3","2","","2","2","2","2","2","3","2","2","2","6","3","2","3","2","2","2","2","6","3","2","2","3","3","2","2","2","2","2","6","3","3","3","3","3","3","2","3","3","3","3","3","2","3","3","3","3","3","3","3","2","2","2","2","2","3","6","2","3","3","2","2","3","3","2","6","2","2","2","2","2","4","2","3","3","3","3","2","2","3","2","1","1","6","3","3","3","3","3","3","2","6","2","3","3","6","3","3","3","2","2","2","2","2","2","2","3","3","3","3","2","3","3","2","3","3","3","2","3","2","6","3","2","3","3","3","3","3","2","3","2","2","3","3","6","3","3","2","3","2","3","2","3","2","2","2","2","3","3","3","3","2","2","2","2","2","3","3","3","3","2","3","3","3","2","3","3","3","2","2","2","2","2","3","3","2","2","2","2","2","3","2","2","2","3","3","3","3","3","3","3","3","2","3","2","2","2","2","3","2","2","3","3","3","3","2","2","2","2","3","2","2","3","3","3","3","2","3","2","2","3","2","3","3","2","2","3","3","3","3","3","3","3","2","3","3","3","3","3","3","2","3","3","2","2","3","2","3","2","3","3","3","3","3","3","3","3","3","3","3","2","2","3","3","2","3","2","3","3","2","2","3","3","3","3","3","3","3","3","3","2","2","3","3","2","3","2","3","3","3","3","3","2","3","3","2","3","3","3","3","3","3","3","3","3","3","2","2","3","3","3","6","2","2","2","2","3","3","3","3","3","3","2","2","3","2","2","2","2","3","3","2","2","4","2","2","3","2","-1","2","3","3","3","2","3","3","3","3","3","2","4","3","3","2","2","3","3","6","2","2","2","3","3","3","3","3","3","3","3","3","2","2","2","2","3","3","3","2","3","3","6","2","2","2","2","2","2","2","2","2","3","3","6","3","3","3","6","2","4","2","2","6","2","3","3","6","3","3","3","2","2","3","3","3","","2","2","2","6","3","3","2","3","2","2","2","2","2","2","2","2","3","3","6","6","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","6","3","3","3","6","3","3","3","3","3","3","3","3","3","3","3","3","6","3","3","3","3","3","3","3","3","3","3","3","2","3","6","3","3","3","3","3","6","3","3","3","3","2","2","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","3","3","3","3","3","3","2","3","3","2","3","3","3","3","2","3","3","3","2","2","2","2","3","3","3","3","2","2","3","3","3","2","2","2","2","2","2","2","3","2","2","2","2","3","2","3","3","3","3","3","3","3","3","3","2","3","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","2","2","2","2","2","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3"];    
    for (var i = 0; i < courses.length; i++) {
        if(courses[i] == cc.toUpperCase()){
            index = i;
            break;
        }
    }
    if(index != -1){
        credit = credits[index];
    }

    if(credit == 0){
        here = 1;
    } else if(credit == 1){
        here = 2;
    } else if(credit == 2){
        here = 3;
    } else if(credit == 3){
        here = 4;
    } else if(credit == 4){
        here = 5;
    } else if(credit == 5){
        here = 6;
    } else if(credit == 6){
        here = 7;
    } 

    return here;
}

