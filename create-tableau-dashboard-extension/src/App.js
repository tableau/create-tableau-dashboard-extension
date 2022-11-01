import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DashboardExtension } from './components/DashboardExtension';
import { Config } from './components/Config';

//  Define default values, which will be passed to each component
const defaults = {
  settingsKey: "settings",
  apiVersion: "3.15"
}

function App( { route }) {
  
  /*  
    We can't use regular react-routing, because that is not supported in Sandboxed dashboard extension. 
    Instead can specify multiple entrypoints, and pass in the component as a parameter
  */

  //  Determine which component to render
  let app;
  if (route==="config") {
    app = <Config settingsKey={defaults.settingsKey} defaultApiVersion={defaults.apiVersion}/>
  } else if (route ==="dashboardExtension") {
    app = <DashboardExtension settingsKey={defaults.settingsKey} />
  }

  //  Render the react app
  return (
    <div>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar newestOnTop theme="colored"
          closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover
      />
      { app }
    </div>
  );
}

export default App;
