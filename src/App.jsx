import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Registro } from './components/Registro';
import { Regdgenper} from './components/Regdgenper';
import {Listper} from './components/Listper';
import {Updper} from './components/Updper';
import {Delper} from './components/Delper';
import { Regdatcom} from './components/Regdatcom';
import {Listdatcom} from './components/Listdatcom';
import {Upddatcom} from './components/Upddatcom';
import { Regdir} from './components/Regdir';
import {Listdir} from './components/Listdir';
import {Upddir} from './components/Upddir';
import {Deldir} from './components/Deldir';
import {Regrel} from './components/Regrel';
import {Listrel} from './components/Listrel';
import {Delrel} from './components/Delrel';
import {Updrel} from './components/Updrel';
import {Regcta} from './components/Regcta';
import {Listcta} from './components/Listcta';
import {Delcta} from './components/Delcta';
import {Updcta} from './components/Updcta';
import { Regdocto } from './components/Regdocto';
import { Listdoc } from './components/Listdoc';
import { Deldoc } from './components/Deldoc';
import { Regkyc } from './components/Regkyc';
import { Listkyc } from './components/Listkyc';
import { Delkyc } from './components/Delkyc';
import { CalificacionPanel } from './components/CalificacionPanel'


import { AuthHandler } from './components/AuthHandler';
import { UnregisteredUser } from './components/UnregisteredUser';
import { ValOtp } from './components/ValOtp';
import { Lisauts } from './components/Lisauts';
import { Listusrauts } from './components/Listusrauts';

import { Regusraut } from './components/Regusraut';
import { Updusraut } from './components/Updusraut';
import { Delusraut } from './components/Delusraut';



import { Principal } from './components/Principal';
import { Listusr } from './components/Listusr';
import { Regusr } from './components/Regusr';
import { Updusr } from './components/Updusr';
import { Delusr  } from './components/Delusr';
import { Listnivtran  } from './components/Listnivtran';
import { Regnivtran  } from './components/Regnivtran';
import { Updnivtran  } from './components/Updnivtran';
import { Delnivtran  } from './components/Delnivtran';
import { Stats  } from './components/Stats';
import { Seltcorp  } from './components/Seltcorp';
import { Regtcorp  } from './components/Regtcorp';
import { Updtacorp  } from './components/Updtacorp';
import { Deltacorp  } from './components/Deltacorp';
import { Listwaf  } from './components/Listwaf';
import { Wafdet  } from './components/Wafdet';
import { Listlogs } from './components/Listlogs';
import { ListLayout } from './components/ListLayout';
import { RegLayout } from './components/RegLayout';
import { UpdLayout } from './components/UpdLayout';
import { DelLayout } from './components/DelLayout';
import { Files } from './components/Files';
import { Listsing } from './components/Listsing';
import { Listsdet } from './components/Listsdet';
import { Delsing } from './components/Delsing';
import { Ejecarch } from './components/Ejecarch';
import { Listproc } from './components/Listproc';
import { Listpdet } from './components/Listpdet';
import { Selproej } from './components/Selproej';
import { RegTrasp } from './components/RegTrasp';

import { Delfinal } from './components/Delfinal';
import { Realeject } from './components/Realeject';
import { Registotp } from './components/Registotp';
import { Listustran } from './components/Listustran';
import { Regcosto } from './components/Regcosto';
import { Listcosto } from './components/Listcosto';
import { Updcosto } from './components/Updcosto';
import { Delcosto } from './components/Delcosto';


import { Listmon } from './components/Listmon';
import { Listent } from './components/Listent';

import { Regcateg } from './components/Regcateg';
import { Listcateg } from './components/Listcateg';
import { Updcateg } from './components/Updcateg';
import { Delcateg } from './components/Delcateg';
import { Listagreg } from './components/Listagreg'





console.log ('entre al app');
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/Regdgenper" element={<Regdgenper />} />
        <Route path="/Listper" element={<Listper/>} />
        <Route path="/Updper" element={<Updper/>} />
        <Route path="/Delper" element={<Delper/>} />
        <Route path="/Regdatcom" element={<Regdatcom />} />
        <Route path="/Listdatcom" element={<Listdatcom/>} />
        <Route path="/Upddatcom" element={<Upddatcom/>} /> 
        <Route path="/Regdir" element={<Regdir />} />     
        <Route path="/Listdir" element={<Listdir/>} />
        <Route path="/Upddir" element={<Upddir/>} /> 
        <Route path="/Deldir" element={<Deldir/>} />
        <Route path="/Regrel" element={<Regrel/>} />     
        <Route path="/Listrel" element={<Listrel/>} />     
        <Route path="/Updrel" element={<Updrel/>} />   
        <Route path="/Delrel" element={<Delrel/>} />
        <Route path="/Regcta" element={<Regcta/>} />     
        <Route path="/Listcta" element={<Listcta/>} />     
        <Route path="/Updcta" element={<Updcta/>} />   
        <Route path="/Delcta" element={<Delcta/>} />  
        <Route path="/Regdocto" element={<Regdocto />} />             
        <Route path="/Listdoc" element={<Listdoc />} />          
        <Route path="/Deldoc" element={<Deldoc />} />  
        <Route path="/Regkyc" element={<Regkyc />} />             
        <Route path="/Listkyc" element={<Listkyc />} />          
        <Route path="/Delkyc" element={<Delkyc />} /> 
        <Route path="/calificacionPanel" element={<CalificacionPanel/>} />
             

     
        
        <Route path="/valotp" element={<ValOtp />} />
        <Route path="/Lisauts" element={<Lisauts />} />
        <Route path="/Listusrauts" element={<Listusrauts />} />
        
        <Route path="/Regusraut" element={<Regusraut />} />
        <Route path="/Updusraut" element={<Updusraut />} />
        <Route path="/Delusraut" element={<Delusraut />} />

        
        <Route path="/auth_callback" element={<AuthHandler />} />
        <Route path="/unregistered-user" element={<UnregisteredUser />} />
        <Route path="/Principal" element={<Principal />} />
        <Route path="/Listusr" element={<Listusr />} />
        <Route path="/Regusr" element={<Regusr />} />
        <Route path="/updusr" element={<Updusr />} />
        <Route path="/Delusr" element={<Delusr />} />
        <Route path="/Listnivtran" element={<Listnivtran />} />
        <Route path="/Regnivtran" element={<Regnivtran />} />
        <Route path="/Updnivtran" element={<Updnivtran />} />
        <Route path="/Delnivtran" element={<Delnivtran />} />
        <Route path="/Stats" element={<Stats />} />
        <Route path="/Seltcorp" element={<Seltcorp />} />
        <Route path="/Regtcorp" element={<Regtcorp />} />
        <Route path="/Updtacorp" element={<Updtacorp />} />
        <Route path="/Deltacorp" element={<Deltacorp />} />
        <Route path="/Listwaf" element={<Listwaf />} />
        <Route path="/Wafdet" element={<Wafdet />} />
        <Route path="/Listlogs" element={<Listlogs />} />
        <Route path="/ListLayout" element={<ListLayout />} />
        <Route path="/RegLayout" element={<RegLayout />} />
        <Route path="/UpdLayout" element={<UpdLayout />} />
        <Route path="/DelLayout" element={<DelLayout />} />

        <Route path="/Files" element={<Files />} />
        <Route path="/Listsing" element={<Listsing />} />
        <Route path="/Listsdet" element={<Listsdet />} />
        <Route path="/Delsing" element={<Delsing />} />
        <Route path="/Ejecarch" element={<Ejecarch />} />
        <Route path="/Listproc" element={<Listproc />} />
        <Route path="/Listpdet" element={<Listpdet />} />
        <Route path="/Selproej" element={<Selproej />} />
        <Route path="/Delfinal" element={<Delfinal />} />
        <Route path="/Realeject" element={<Realeject />} />
        <Route path="/RegTrasp" element={<RegTrasp />} />
        <Route path="/Registotp" element={<Registotp />} />
        <Route path="/Listustran" element={<Listustran />} />
        <Route path="/Regcosto" element={<Regcosto />} />
        <Route path="/Listcosto" element={<Listcosto />} />
        <Route path="/Updcosto" element={<Updcosto />} />
        <Route path="/Delcosto" element={<Delcosto />} />

        
        




        <Route path="/Listmon" element={<Listmon />} />
        <Route path="/Listent" element={<Listent />} />

        <Route path="/Regcateg" element={<Regcateg/>} />
        <Route path="/Listcateg" element={<Listcateg/>} />
        <Route path="/Updcateg" element={<Updcateg/>} />
        <Route path="/Delcateg" element={<Delcateg/>} />
        <Route path="/Listagreg" element={<Listagreg/>} />

        {/* Redireccionar cualquier otra ruta a la principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
