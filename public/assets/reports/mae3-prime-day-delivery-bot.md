MAE3 Robot Report

# **Prime Day Delivery Bot**

## By: Dylan Bailes

![][image1]

# 

# **Introduction**

This robot uses a 2 stage differential elevator lift as the main mechanism for scoring balls as well as assisting with the bucket in intaking balls from the center pendulum. The bucket uses a string and passive spring system to allow it to stay closed when not needed. In addition, both of these components are mounted on a drivebase with a friction drive that allows the robot to move around the playing field.

## **Bucket**

The bucket works by having a string attached to a pulley on a geared motor mounted on the base of the robot. When the motor turns it rotates the pulley and tightens the string which pulls against the springs in the bucket. This allows the bucket to passively hold the balls as well as release them when needed.

## **Friction Drive**

The friction drive works by using a spring to increase the friction between the motor shaft and the rubber bands on the wheels. A large gear ratio is created due to the small shaft radius of the motor compared to the radius of the wheel. This allows the robot to drive and move around the field despite the large weight of the robot at 2.3kg.

## **Elevator**

The elevator works by using a differential lift to raise the elevator stages sequentially. By rotating the motors on the pulleys towards the center of the elevator it tightens the string on the exterior while letting out string towards the center pulley on the first stage the tension created by this forces the second and first stage to raise up along with the center pulley in order to relieve the forces. This also works in the reverse as by rotating towards the outside you remove string length from the center and push it to the outside causing the elevator to compress once again. 2 sets of bearing blocks brace each stage to the one after it as well as the stage to the previous stage. This allows it to maintain planar motion and solves a key problem we had earlier on.

## **Functional Elevator Requirements**

The elevator has several requirements for success:

* Elevator must be able to reach the 10x multiplier zone  
* Elevator must be able to reach from fully compressed to max extension in less than 30 sec  
* Elevator must be able to freely control its height for the full range of motion  
* Elevator must be able to lift the mass of 20 balls \+ the mass of the bucket to full extension

## **Performance of Elevator**

The component faced mixed success. Due to failures with the first stage having too much friction to lift, as well as the string being too short to extend to max extension, the reach of the elevator is only 20 inches and insufficient to reach the 10x and 5x zone. However, the lift time was successful as it can reach max extension in about 6 seconds, which makes sense given that the feed of the string based on the size of the pulley and speed of the motor is 3.3” per second. In addition, it is able to extend and hold at any position within the 20 inch reach. Furthermore, the robot could lift 0.82kg which far exceeds the 0.325kg required to lift 20 balls plus the bucket.

# **Analysis**

## **Problem Statement**

Through this analysis my goal is to determine whether the motors in the elevator system are sufficient to lift the mass of the bucket \+ 20 balls from a fully compressed state to a state of max extension. To do this we will be analyzing the maximum mass the elevator can lift to full extension.

## **Assumptions**

In this analysis I assumed that the pulley system used is both massless and frictionless, the string does not compress, the mass of the bucket and balls can be approximated by a point mass at the top of the elevator. In addition, I assumed that the third stage of the elevator is rigidly fixed to the drivebase, so we can ignore its mass, as well as quasi static analysis so the motor is operating at stall torque.

## **Free Body Diagrams**

## **Parameters**

* D \= 26.95”, 0.685 m  
* Ddelta \= 17.15”, 0.436 m  
* dcom1 \= 22.05”, 0.56 m  
* dcom2=13.55”, 0.344 m  
* dN1 \= 18.06”, 0.459 m  
* dN2 \= 17.33”, 0.44 m  
* dN3 \= 10.86”, 0.276 m  
* dN4 \= 10.13”, 0.257 m  
* dcomsys= 5.08”, 0.129 m  
* t \= 30s  
* m \= mass of bucket and balls  
* m1 \= mass of stage 1 \= 0.38 kg  
* m2  \= mass of stage 2 \= 0.42 kg  
* msys  \= mass of system not including bucket 1.39 kg   
* 0.8 \= coeff. of friction for acrylic on acrylic

## **Calculations**

**M=mgDsin(40)+m1gdcom1sin(40)+m2gdcom2sin(40)-N1dN1-N2dN2-N3dN3-N4dN4=0**  
N1=N2=N3=N4  
M=mgDsin(40)+m1gdcom1sin(40)+m2gdcom2sin(40)-N1(dN1+dN2+dN3+dN4)  
N1=(mgDsin(40)+m1gdcom1sin(40)+m2gdcom2sin(40))/(dN1+dN2+dN3+dN4)  
N1=(4.312m+2.25)/1.43  
Fx=2Fmotorcos(50)-f1cos(50)-f2cos(50)-f3cos(50)-f4cos(50)=0  
Fx=2Fmotorcos(50)-4N1cos(50)  
Fmotor=Tstall/r=32.48N  
Fx=2\*32.48cos(50)-4\*0.8\*((4.312m+2.25)/1.43)\*cos(50)  
Fx=41.76-2.06cos(50)((4.312m+2.25)/1.43)  
m=(41.76\*1.43/(2.06cos(50))-2.25)/4.312  
m=9.93kg  
Fy=2Fmotorsin(50)-mg-m1g-m2g-4N1sin(50)=0  
Fy=2\*32.5\*sin(50)-9.8m-9.8\*0.38-9.8\*0.42-4\*0.8\*sin(50)\*(4.312m+2.25)/1.43  
m=1.43\*(49.76-7.84-3.857)/(9.8+10.57)  
m=2.67kg  
Pmotor=(0.5\*Tstall)\*(0.5\*noload)=0.324 watts  
Emotor=0.324\*60=19.44J  
Energy=2Emotor-msysgdcomsys-mgDdelta  
2\*19.44-1.39\*9.8\*0.129-9.8m\*0.436=0  
m=8.69kg  
Power=2\*Pmotor-msysgdcomsys/t-mgDdelta/t  
m=30\*(0.648-0.116)/(9.8\*0.436)  
m=3.74 kg  
FSForce= FAvailableFRequired=2.67kg0.325kg=8.2  
Percent Error Between Mass Lift Expected And Actual \=   
| (Experimental) \- (Theoretical) |(Theoretical)(100)=| 2.67 kg \- 0.83 kg |0.83 kg (100)=221.7% 

## **Conclusions**

From these results we can see that the motors and elevator system will be more than sufficient to lift the required mass of 0.325kg which is the weight of the bucket and 20 balls. From my calculations the greatest limiting factor is the torque of the motor and from my calculations at a weight of 2.67kg it will be insufficient to lift anymore. Based on this the theoretical factor of safety is 8.2. From the experiment I performed though I found that the lift we built failed at just 0.83kg of mass. This gives us a percent error of 221.7%, but this make sense given that this analysis ignored several things such as the friction between the rope and the pulleys, the bend in the elevator which causes the friction between the stages to increase greatly, as well as the fact that the motor does not operate perfectly at its stall torque, and that the mass of the bucket is not perfectly concentrated at one point. The limitations of this design is that it requires a very small amount of overlap between the stages in order to reach the desired distance, this means that it is very prone to bending, which in turn makes it harder for the stages to move increasing the risk of the stage jamming. If I had to redesign this I would have focused more on overlap between the stages and limited the reach to about 25 inches and then use a four bar attached to the top of the elevator for the additional distance which should also allow for me to make a more passive scoring mechanism. In addition, one direction I would have liked to try out is a shooting robot as I dismissed it at the start of the competition believing it would be very difficult to create an accurate one. Overall, I think the biggest thing I’ve taken away from this is that I should focus on reliability over high potential, given the time constraints. For a project like this where we don’t have a lot of time or iteration potential with designs, it is better to go for a known or simple design even if it scores less points than a high point design that may or may not work and may or may not be consistent with its working. Overall, I think that this was a very ambitious, but fun robot to work on, in the end it still has a few minor flaws, but with a bit more modification and redesigning of parts it can be very successful.

## **Design Process Essay**

		When coming up with designs for the robot, there were many times when it was difficult to come up with ideas or solutions to problems that arise. One major area for this was in fixing the planar motion of the elevator. After the risk reduction test we realized that this was going to be a major issue we would need to solve for the elevator to work properly. However, as I still wanted to allow our robot to reach a full 30” extension I wasn’t sure what to do as we were already at the limit to fit in the box as well. In order to come up with ideas for solutions I started by looking at a bunch of similar designs dealing with constraining motion. Most of the designs solved this issue by having a large bearing block with large overlap, but the tight fit meant this wouldn’t work for us. I consulted my teammates and friends but almost all solutions ran into the issue of limiting the reach. I was holding onto the goal of the 10x multiplier, but it was holding my team back. Eventually, my team and I came up with a few implementations to maintain the 10x reach during group design meetings, but they all came with added complexity and upon prototyping a few of them we realized it would take a lot more work to get this into a state that might work. This failure with creating a working design led to me pushing it off saying I’d fix it after we’d got the rest of the robot working, but even after everything else worked I didn’t want to give it up. Eventually, I talked with my group and realized what the goal of this project is. It is to create a robot that best accomplishes the game and while the potential of my design was tempting it was going to fail at the goal, we needed something that worked, so we thought about what I’d done so far with one set of bearing blocks, and while brainstorming I thought about the shaft between 2 bearings and how that constrained it most effectively. I realized that by adding a bearing that went from the stage after back to the stage before you could conserve much of the reach, while having great stability at the start that decreased as it extended but should remain enough to keep the elevator level. Creating this taught me a lot about my design process and how willingness to change the design and an evaluation of its goals can go a long way. Because I was trying to stick to my original nearly impossible constraints, I was being constantly roadblocked, but by taking a step back and changing the premises we were able to get working solutions produced faster and with less complexity. In the future, I think prioritizing design goals is key. The 10x should have been a want not a need, and so switching to creating a consistent 5x or 2x bot should have been a quick group decision that we could make, while still keeping in mind the original goal, but focus on making something that works first.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnAAAAAECAYAAAAOPwJdAAAANElEQVR4Xu3WMQ0AMAwEseAOoJIpqGYvgrzkwcshuLqnHwAAOeoPAADsZuAAAMIYOACAMAOTpGslhjl7rwAAAABJRU5ErkJggg==>