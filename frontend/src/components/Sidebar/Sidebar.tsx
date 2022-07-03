import './Sidebar.css'

interface ISidebarProps {
  sidebarVisibility: boolean;
}


function Sidebar(props: ISidebarProps) {
  if (!props.sidebarVisibility) {
    return <></>
  }

  return (
    <>
      <nav id="sidebarMenu" className="col-md-2 col-lg-1 d-md-block bg-light sidebar collapse">
        <div className="position-sticky pt-3">
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">
                All Channels
              </a>
            </li>
          </ul>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Hololive</span>
          </h6>

          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/hololive">
                All Hololive
              </a>
            </li>
          </ul>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Nijisanji</span>
          </h6>

          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/hololive">
                All Nijisanji
              </a>
            </li>
          </ul>

        </div>
      </nav>
    </>
  );
}

export default Sidebar;