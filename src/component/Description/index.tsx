const Description = () => {
    return (
        <section style={{ fontSize: 18, display : 'flex' }}>
            <div style={{ padding: 6 }}>
                ' Mouse Right ' Rotation    <br />
                ' Mouse Wheel ' Zoom in/out <br />
                ' Mouse Wheel ' Pan   <br />
            </div>
            <div style={{ padding: 6 }}>
                ' W,A,S,D ' to move <br />
                ' Left Click ' on grid to move<br />
                ' Space ' to jump<br />
                ' Shift ' to change ' Running ' or ' Walking '<br />
                ' Drag red points ' to change curve
            </div>
        </section>
    )
}

export default Description;