<?php
$root = realpath($_SERVER["DOCUMENT_ROOT"]);
include('db.class.php'); // call db.class.php
$mydb = new db(); // create a new object, class db()
$conn = $mydb->connect();
$data=[]; 

if(!empty($_POST)){  
    $dataArr = json_decode($_POST["postData"],true);
    $action = $dataArr['action'];
}
else if(!empty($_GET)){
    $action = $_GET["action"];
 }

if(isset($action) && $action === 'list-request'){
    $search_keyword = $_GET["search_keyword"];
    

    $sql = "SELECT  r.id,r.type, r.name, r.course_type_id, r.user_id, ct.name as coursetype,  a.username, r.intended_class as intendedclass, r.approved FROM requests r INNER JOIN account a on r.user_id = a.id INNER JOIN course_type ct on r.course_type_id = ct.id where 1=1  ";
    if($search_keyword != '')
      $sql .=" AND type = '".$search_keyword."'  ";
    $sql .=" order by r.id desc";
      
    $requests = $conn->prepare($sql);
    $requests->execute();
    $allRequests = $requests->fetchAll(PDO::FETCH_ASSOC);
    $newArr = [];

    foreach($allRequests as $key=>$request) {    
            
        if ($request['type'] == "course") {        
          $checkForBreakdown = $conn->prepare("SELECT id FROM breakdowns WHERE 
          user_id='".$request['user_id']."' 
          AND coursename ='".$request['name']."'
          AND course_type_id='".$request['course_type_id']."'");
          $checkForBreakdown->execute();
      //  echo  $checkForBreakdown->debugDumpParams(); 
          $breakdownCheck = $checkForBreakdown->fetchColumn();
          $count = $checkForBreakdown->rowCount();

          if ($count > 0) {            
              $hashedName = hash('sha256', $breakdownCheck);
              $fileLocation = "./breakdowns/".$hashedName.".txt";
              if($myfile = fopen($fileLocation, "r")){
                $result = fread($myfile, filesize($fileLocation));
                $breakdown =json_decode( $result,true);
              
                }else
                  $breakdown ='';

                  $request['breakdown'] =  $breakdown;           
              //  $courseRequests .= " style='cursor: pointer;' onclick='lockBreakdown(this)' onmouseover='showBreakdown(this)' onmouseout='hideBreakdown(this)'>".$breakdown."</td><td><a href='#' onclick='approveRequest(this, ".$request['id'].")'>Approve</a></td></tr>";
                }
                
    
        }
        $newArr[] = $request;
    }  
  // / echo "<pre>";print_r($newArr);
   
    echo json_encode($newArr);
   }
   else if(isset($action) && $action === 'approve-request'){
    $request_id= $_GET['request_id'];
    $sql = $conn->prepare("SELECT * FROM requests WHERE id=".$request_id);
    $sql->execute();
    $request = $sql->fetch();
    if ($request['type'] == "course") {
        $checkForBreakdown = $conn->prepare("SELECT id,course_id FROM breakdowns WHERE user_id= :user_id AND coursename = :coursename AND course_type_id= :course_type_id");
        $checkForBreakdown->bindValue(':user_id', $request['user_id']);
        $checkForBreakdown->bindValue(':coursename', $request['name']);
        $checkForBreakdown->bindValue(':course_type_id', $request['course_type_id']);
        $checkForBreakdown->execute();
        $breakdownCheck = $checkForBreakdown->fetch();
        $coursename = "'".$request['name']."'";
        $course_type_id = "'".$request['course_type_id']."'";
        if (!empty($breakdownCheck)) {
          $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
          $sql = "UPDATE courses SET approved=?, breakdown=? WHERE id=?";
          $conn->prepare($sql)->execute([1, 1, $breakdownCheck['course_id']]);
          $approve = $conn->prepare("UPDATE requests SET approved = 1 WHERE id=".$request_id);
          $approve->execute();
          echo "success";
      } else {
          $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);         
          $courseQuery = $conn->prepare("SELECT id FROM courses WHERE user_id= :user_id AND coursename = :coursename AND course_type_id= :course_type_id");
          $courseQuery->bindValue(':user_id', $request['user_id']);
          $courseQuery->bindValue(':coursename', $request['name']);
          $courseQuery->bindValue(':course_type_id', $request['course_type_id']);
          $courseQuery->execute();
          $courseID = $courseQuery->fetchColumn();         

         $sql = "UPDATE courses SET approved=?, breakdown=? WHERE id=?";
         $conn->prepare($sql)->execute([1, 0, $courseID]);
        
      //   echo  $approve->debugDumpParams(); 
        
          $approve = $conn->prepare("UPDATE requests SET approved = 1 WHERE id=".$request_id);
          $approve->execute();
      
          echo "success";
      }
    }
    else if ($request['type'] == "breakdown") {
        $findCourse = $conn->prepare("SELECT id FROM courses WHERE coursename= :coursename AND course_type_id= :course_type_id");
        $findCourse->bindValue(':coursename', $request['name']);
        $findCourse->bindValue(':course_type_id', $request['course_type_id']);
        $findCourse->execute();
        $courseID = $findCourse->fetchColumn();
        $findBreakdown = $conn->prepare("SELECT id FROM breakdowns WHERE coursename= :coursename AND user_id= :user_id AND course_type_id= :course_type_id");
        $findBreakdown->bindValue(':coursename', $request['name']);
        $findBreakdown->bindValue(':user_id', $request['user_id']);
        $findBreakdown->bindValue(':course_type_id', $request['course_type_id']);
        $findBreakdown->execute();
        $breakdownID = $findBreakdown->fetchColumn();
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      
        $sql = "UPDATE breakdowns SET approved=?, course_id=? WHERE id=?";
        $conn->prepare($sql)->execute([1, $courseID, $breakdownID]);

        $approve = $conn->prepare("UPDATE requests SET approved = 1 WHERE id=".$request_id);
        $approve->execute();
        echo "success";
  }
}
else if(isset($action) && $action === 'list-saved-articles'){
  $allSA = $conn->prepare("SELECT sa.*, c.coursename,c.image FROM saved_articles sa inner join courses c on sa.course_id = c.id");
  $allSA->execute();
  $savedArt = $allSA->fetchAll(PDO::FETCH_ASSOC);   
  echo json_encode($savedArt);  
}
else if(isset($action) && $action === 'list-submitted-articles'){
    $keyword =  !empty($_GET['keyword']) ? "%".$_GET['keyword']."%" : null;
    $course_id =  !empty($_GET['course_id'])  ? $_GET['course_id']  : null;
 //   $allSA = $conn->prepare("SELECT sa.*, c.coursename FROM submitted_articles sa inner join courses c on sa.course_id = c.id where 1=1 ");
 //   $allSA->execute();
 //   $savedArt = $allSA->fetchAll(PDO::FETCH_ASSOC);
    $params = [];
    $sql ="SELECT sa.*, c.coursename,c.image FROM submitted_articles sa inner join courses c on sa.course_id = c.id";
    if($course_id != ''){
      $params['course_id'] = $course_id;
      $sql.= " and sa.course_id = :course_id";
    }
    if($keyword != ''){
      $params['articlename'] = "%$keyword%";
      $sql.= " and sa.articlename like :articlename ";
    }
    $subArts = $conn->prepare($sql);
    $subArts->execute($params);   
    $allArticles = $subArts->fetchAll(PDO::FETCH_ASSOC);
    //$subArts->debugDumpParams();  
    $newArr =[];
     
    foreach($allArticles as $key=>$data) {   
         // $arr = [];         
            $timeago  = time_Ago($data['last_updated']);
       //   $arr= $data;
          $data['last_updated'] = $timeago;
          $newArr[] = $data;
        
    }
 
 //echo "<pre>";print_r($newArr);
    echo json_encode($newArr);  
 
}
else if(isset($action) && $action === 'change-course-image'){
  $course_id = $dataArr['course_id']; 
  $hashedFile = hash('sha256', $course_id);
  //$changePFP->debugDumpParams(); 
  
  $response = array();

  $upload_name = "./uploads/courses/".$hashedFile.".png";
  $url = "uploads/courses/".$hashedFile.".png";
 
  if($_FILES['courseImg'])
  {
      $courseImg = $_FILES["courseImg"]["name"];
      $courseImg_tmp_name = $_FILES["courseImg"]["tmp_name"];
      $error = $_FILES["courseImg"]["error"];

      if($error > 0){
          $response = array(
          "status" => "error",
          "error" => true,
          "message" => $error
          );
      }
      else 
      {         
          if(move_uploaded_file($courseImg_tmp_name , $upload_name)) {

              $changePFP = $conn->prepare("UPDATE courses SET  image=:image WHERE id = :course_id");
              $changePFP->bindParam('course_id', $course_id);    
              $changePFP->bindParam('image', $url);    
              $changePFP->execute();
            
              $response = array(
              "status" => "success",
              "error" => false,
              "message" => "File uploaded successfully",
              "url" =>$url
              );
          }
          else
          {
              $response = array(
              "status" => "error-upload",
               "error" => true,
              "message" => "Error uploading the file!"
              );
           }
      }
      
  }
  else{
      $response = array(
      "status" => "error",
      "error" => true,
      "message" => "No file was sent!"
      );
  }

  echo json_encode($response);
}


function time_Ago($time) {

	// Calculate difference between current
	// time and given timestamp in seconds
	$diff	 = time() - $time;
	
	// Time difference in seconds
	$sec	 = $diff;
	
	// Convert time difference in minutes
	$min	 = round($diff / 60 );
	
	// Convert time difference in hours
	$hrs	 = round($diff / 3600);
	
	// Convert time difference in days
	$days	 = round($diff / 86400 );
	
	// Convert time difference in weeks
	$weeks	 = round($diff / 604800);
	
	// Convert time difference in months
	$mnths	 = round($diff / 2600640 );
	
	// Convert time difference in years
	$yrs	 = round($diff / 31207680 );
	
	// Check for seconds
	if($sec <= 60) {
		return "$sec secs ago";
	}
	
	// Check for minutes
	else if($min <= 60) {
		if($min==1) {
			return "1 min ago";
		}
		else {
			return "$min mins ago";
		}
	}
	
	// Check for hours
	else if($hrs <= 24) {
		if($hrs == 1) {
			return "1 hr ago";
		}
		else {
			return "$hrs hrs ago";
		}
	}
	
	// Check for days
	else if($days <= 7) {
		if($days == 1) {
			return "Yesterday";
		}
		else {
			return "$days days ago";
		}
	}
	
	// Check for weeks
	else if($weeks <= 4.3) {
		if($weeks == 1) {
			return "1 week ago";
		}
		else {
			return "$weeks weeks ago";
		}
	}
	
	// Check for months
	else if($mnths <= 12) {
		if($mnths == 1) {
			return "1 month ago";
		}
		else {
			return "$mnths months ago";
		}
	}
	
	// Check for years
	else {
		if($yrs == 1) {
			return "1 yr ago";
		}
		else {
			return "$yrs yrs ago";
		}
	}
}


?>