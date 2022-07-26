import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col'
import { Link } from 'react-router-dom'
import './Sidebar.css'

interface ISidebarProps {
  sidebarVisibility: boolean;
}


function Sidebar(props: ISidebarProps) {
  if (!props.sidebarVisibility) {
    return <></>
  }

  return (
    <Nav id="sidebarMenu" as={Col} md={2} lg={1} bg='light' className="d-md-block sidebar collapse">
      <Nav className="flex-column pt-3">
        <Nav.Item>
          <Nav.Link as={Link} to={"/"} aria-current="page">
            My Subscriptions
          </Nav.Link>
          <Nav.Link as={Link} to={"/"} aria-current="page">
            All Channels
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
        <span>Hololive</span>
      </h6>

      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link as={Link} to={"/hololive/"} aria-current="page">
            All Hololive
          </Nav.Link>
          <Nav.Link as={Link} to={"/hololive/HoloJP"} aria-current="page">
            HoloJP
          </Nav.Link>
          <Nav.Link as={Link} to={"/hololive/HoloID"} aria-current="page">
            HoloID
          </Nav.Link>
          <Nav.Link as={Link} to={"/hololive/HoloEN"} aria-current="page">
            HoloEN
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
        <span>Nijisanji</span>
      </h6>

      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link as={Link} to={"/nijisanji/"} aria-current="page">
            All Nijisanji
          </Nav.Link>
          <Nav.Link as={Link} to={"/nijisanji/NijiJP"} aria-current="page">
            JP
          </Nav.Link>
          <Nav.Link as={Link} to={"/nijisanji/NijiID"} aria-current="page">
            ID
          </Nav.Link>
          <Nav.Link as={Link} to={"/nijisanji/NijiEN"} aria-current="page">
            EN
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Nav>
  );
}

export default Sidebar;