PennController.ResetPrefix(null) // Keep this here
var showProgressBar = false;

Sequence("welcome", randomize("experiment"), SendResults(), "end")

// IMPORTANT NOTE: when running this project, the eye-tracker will highlight
// the element that it estimates the participant is looking at
// Edit the file PennController.css in the Aesthetics folder to remove highlighting
//
// NOTE: this template will not *actually* collect eye-tracking data,
//       because the command EyeTrackerURL below points to a dummy URL

// Preload pictures
PreloadZip("https://raw.githubusercontent.com/keyue-c/Eye_track_EngMPs/main/chunk_includes/pictures1.zip");
PreloadZip("https://raw.githubusercontent.com/keyue-c/Eye_track_EngMPs/main/chunk_includes/pictures2.zip");
// Preload audio recordings
PreloadZip("https://raw.githubusercontent.com/keyue-c/Eye_track_EngMPs/main/chunk_includes/recordings.zip");

// Replace the URL with one that points to a PHP script that you uploaded to your webserver
// see: https://doc.pcibex.net/how-to-guides/collecting-eyetracking-data/#php-script
EyeTrackerURL("https://dummy.url/script.php")

// Welcome page: we do a first calibration here---meanwhile, the resources are preloading
newTrial("welcome",
    newText(`<p>This experiment needs to access your webcam to follow your eye movements.</p>
            <p>We will only collect data on where on this page your eyes are looking during the experiment.</p>`)
        .center()
        .print()
    ,
    newButton("I understand. Start the experiment")
        .center()
        .print()
        .wait( newEyeTracker("tracker").test.ready() )
        .remove()
    ,
    clear()
    ,
    fullscreen()
    ,
    // Start calibrating the eye-tracker, allow for up to 2 attempts
    // 50 means that calibration succeeds when 50% of the estimates match the click coordinates
    // Increase the threshold for better accuracy, but more risks of losing participants
    getEyeTracker("tracker").calibrate(50,2)
    ,
    newText(`<p>You will see the same button in the middle of the screen before each trial.</p>
             <p>Click and fixate it for 3 seconds to check that the tracker is still well calibrated.</p>
             <p>If it is, the trial will start after 3 seconds. Otherwise, you will go through calibration again.</p>`)
        .center()
        .print()
    ,
    newButton("Go to the first trial")
        .center()
        .print()
        .wait()
)

// Wait if the resources have not finished preloading by the time the tracker is calibrated
CheckPreloaded()

// Only run 24 first trials defined in the table (it's a long experiment....)
Template( "items.csv" , row =>
    newTrial("experiment",
        // Check/recalibrate the tracker before every trial
        newEyeTracker("tracker").calibrate(50,2)
        ,
        // 250ms delay
        newTimer("blank_postfixation", 250).start().wait()
        ,
        // We will print four character-card pairs of images, one on each quadrant of the page
        // The images are 35%-width x 30%-height of the page, but each picture is contained
        // in a 40% Canvas so as to capture slightly-off gazes
        defaultImage.size("30vw", "30vh")
        ,
        newCanvas("Position1", "40vw", "40vh")
            .add( "center at 50%" , "middle at 50%" , newImage(row.Position1) )
            .print( "center at 25vw" , "middle at 25vh" )
        ,
        newCanvas("Position2", "40vw", "40vh")
            .add( "center at 50%" , "middle at 50%" , newImage(row.Position2) )
            .print( "center at 75vw" , "middle at 25vh" )
        ,
        newCanvas("Position3", "40vw", "40vh")
            .add( "center at 50%" , "middle at 50%" , newImage(row.Position3) )
            .print( "center at 75vw" , "middle at 75vh" )
        ,
        newCanvas("Position4", "40vw", "40vh")
            .add( "center at 50%" , "middle at 50%" , newImage(row.Position4) )
            .print( "center at 25vw" , "middle at 75vh" )
        ,
        newTimer("preview", 2000 ).start().wait()
        ,
        newAudio("sentence", row.Audio).play()
        ,
        newTimer("delay_eyetracking", parseInt(row.MWon) - 1000 ).start().wait()
        ,
        getEyeTracker("tracker")
            .add(   // We track the Canvas elements   
                getCanvas("Position1"),
                getCanvas("Position2"),
                getCanvas("Position3"),
                getCanvas("Position4") 
            )
            .log()  // If this line is missing, the eye-tracking data won't be sent to the server
            .start()
        ,
        // Wait for a click on one of the four Canvas elements
        newSelector("answer")
            .add(
                getCanvas("Position1"),
                getCanvas("Position2"),
                getCanvas("Position3"),
                getCanvas("Position4") 
            )
            .once()
            .log()
            .wait()
        ,
        // Stop now to prevent collecting unnecessary data
        getEyeTracker("tracker")
            .stop()
        ,
        // Make sure playback is over before moving on
        getAudio("sentence").wait("first")
        ,
        newTimer("blank_posttrial", 250).start().wait()
    )
)

newTrial("end",
    exitFullscreen()
    ,
    newText("The is the end of the experiment, you can now close this window. Thank you!")
        .center()
        .print()
    ,
    newButton("waitforever").wait() // Not printed: wait on this page forever
)

