Skip to content
Navigation Menu
amazingshellyyy
Rummikub

Type / to search
Code
Issues
Pull requests
Actions
Projects
Security
Insights
You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork WaekyTV/Rummikub, so you can send a pull request.
Rummikub/js
/
script.js
in
master

Edit

Preview
Indent mode

Spaces
Indent size

4
Line wrap mode

No wrap
Editing script.js file contents
872
873
874
875
876
877
878
879
880
881
882
883
884
885
886
887
888
889
890
891
892
893
894
895
896
897
898
899
900
901
902
903
904
905
906
907
908
909
910
911
912
913
914
915
916
917
918
919
920
921
922
923
924
925
926
927
928
929
930
931
932
933
934
    console.log(groupArr);
    console.log('groupboard pass the test!');
    return true;
}



const done = ()=> {
    if (validation() === true) {
        if (playerTile.length === 0) {
            alert('You Rock!!!');
            $('.container1, .container2, .container3').css('filter','blur(2px)');
            $('.win').css('display', "");
            
            //end Game
        } else {
            alert('Draw one Card and keep Going!');
            drawCard();
            // snap();
        }
    } else { 
        alert('playground not valid, try again! Draw one card!');
        // reverse(screenShot);
        // console.log(groupBoard);
        // console.log(runBoard);
        // renderGroupBoard(groupBoard);
        // renderRunBoard(runBoard);
        // renderPlayerTile(playerTile);
        drawCard();
    }
}

$('.done').on('click', done);


$('.restart').on('click', ()=> {
    // history.go(0);
    // window.location.reload();
    // console.log("runboard bf clean clean",runBoard);
    // cleanUp(runBoard);
    // console.log("runboard after clean",runBoard);
    // console.log("groupboard bf clean clean",groupBoard);
    // cleanUp(groupBoard);
    // console.log("groupboard after clean",groupBoard);
    runRoots = [];
    groupRoots = [];
    $('.win').css('display','none');
    $('.start').css('display',"none");
    $('.container1, .container2, .container3').css('filter','');
    // console.log("bf GP",runBoard);
    // console.log("bf GP",groupBoard);
    generatePlayground();
    // console.log("afterGP",runBoard);
    // console.log("afterGP",groupBoard);
});

$('.startbtn').on('click', ()=> {
    $('.start').css('display',"none");
    $('.container1, .container2, .container3').css('filter','');
})

generatePlayground();
filterUsed();
Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
Editing Rummikub/js/script.js at master · amazingshellyyy/Rummikub
 
