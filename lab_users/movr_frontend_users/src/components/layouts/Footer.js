import React, { Fragment } from 'react'
import './index.css'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        //THIS COMPONENT IS NOT USED!!
        <Fragment>
            <div class="footer text-white">
  @2020 <Link to="/">CockRoach Labs</Link>
</div>
        </Fragment>
    )
}

export default Footer
