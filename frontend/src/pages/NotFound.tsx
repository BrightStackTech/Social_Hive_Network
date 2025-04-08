import React from 'react';
import { TbWorldExclamation } from 'react-icons/tb';

const NotFound: React.FC = () => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center"  }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{display: "flex", alignItems: "center"}}>
                    <TbWorldExclamation style={{fontSize: "15rem"}} />
                  <h1 style={{ fontSize: "13rem", margin: "0", fontWeight: "bold" }}>404</h1>
              </div>
        <h2 style={{fontSize: "2rem", margin: "0"}}>Page doesn't exist</h2>
      </div>
    </div>
  );
};

export default NotFound;